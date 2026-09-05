import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";

interface CreateCourseInput {
  title: string;
  description?: string;
  thumbnail?: string;
  trailerUrl?: string;
  priceBdt?: number;
  instructor?: string;
  category?: string;
  metadata?: Record<string, any>;
  highlights?: {
    hours?: string;
    lessons?: string;
    access?: string;
    certificate?: string;
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Headless LMS Course Creation Endpoint
 * Executes native createProductsWorkflow with digital LMS metadata & sales channels
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as CreateCourseInput;

  if (!body?.title) {
    return res.status(400).json({ success: false, message: "Course title is required" });
  }

  const priceBdt = Number(body.priceBdt) || 1299;
  let slug = slugify(body.title) || `course-${Date.now()}`;
  const incomingMeta = body.metadata || {};
  const highlights = body.highlights || incomingMeta.highlights || {};

  // Ensure unique handle in product module to avoid duplicate key constraint errors
  try {
    const productModuleService = req.scope.resolve("product");
    const existing = await productModuleService.listProducts({ handle: slug });
    if (existing && existing.length > 0) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
  } catch {}

  const safeThumbnail =
    (body.thumbnail && !body.thumbnail.startsWith("data:") ? body.thumbnail.trim() : null) ||
    (incomingMeta.thumbnail && !incomingMeta.thumbnail.startsWith("data:") ? incomingMeta.thumbnail : null) ||
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80";

  const cleanMeta = { ...incomingMeta };
  if (cleanMeta.thumbnail && cleanMeta.thumbnail.startsWith("data:")) {
    cleanMeta.thumbnail = safeThumbnail;
  }
  if (cleanMeta.image && cleanMeta.image.startsWith("data:")) {
    cleanMeta.image = safeThumbnail;
  }

  // 1. Resolve default Sales Channel so course appears in storefront
  let salesChannelIds: Array<{ id: string }> = [];
  try {
    const salesChannelModule = req.scope.resolve("sales_channel");
    const channels = await salesChannelModule.listSalesChannels({});
    if (channels && channels.length > 0) {
      salesChannelIds = [{ id: channels[0].id }];
    }
  } catch (err: any) {
    console.warn("Could not resolve default sales channel:", err.message);
  }

  // 2. Resolve default Shipping Profile to satisfy Medusa database requirements
  let shippingProfileId: string | undefined = undefined;
  try {
    const fulfillmentModule = req.scope.resolve("fulfillment");
    const profiles = await fulfillmentModule.listShippingProfiles({});
    if (profiles && profiles.length > 0) {
      shippingProfileId = profiles[0].id;
    }
  } catch (err: any) {
    console.warn("Could not resolve shipping profile:", err.message);
  }

  try {
    const { result } = await createProductsWorkflow(req.scope).run({
      input: {
        products: [
          {
            title: body.title.trim(),
            handle: slug,
            description: body.description?.trim() || incomingMeta.subtitle || "Comprehensive digital masterclass on Sakil Hub.",
            thumbnail: safeThumbnail,
            status: "published" as any,
            discountable: true,
            is_giftcard: false,
            shipping_profile_id: shippingProfileId,
            sales_channels: salesChannelIds.length > 0 ? salesChannelIds : undefined,
            options: [
              {
                title: "Tier",
                values: ["Full Lifetime Access"],
              },
            ],
            variants: [
              {
                title: "Full Lifetime Access",
                options: {
                  Tier: "Full Lifetime Access",
                },
                manage_inventory: false,
                allow_backorder: true,
                prices: [
                  {
                    currency_code: "bdt",
                    amount: priceBdt,
                  },
                  {
                    currency_code: "usd",
                    amount: Math.max(10, Math.round(priceBdt / 115)),
                  },
                ],
              },
            ],
            metadata: {
              ...incomingMeta,
              is_digital_course: true,
              trailer_url: body.trailerUrl?.trim() || incomingMeta.trailer_url || incomingMeta.trailerUrl || "",
              instructor: body.instructor?.trim() || incomingMeta.instructor || "Sakil Ahmed",
              format: incomingMeta.format || "4K On-Demand Video",
              certificate: incomingMeta.certificate ?? true,
              hours: highlights.hours || incomingMeta.hours || "Self-Paced",
              lessons: highlights.lessons || incomingMeta.lessons || "Comprehensive",
              fulfillment: "Instant Digital Access",
            },
          },
        ],
      },
    });

    console.log("HEADLESS LMS COURSE CREATED:", result[0]?.id, result[0]?.title);

    return res.json({
      success: true,
      message: "Digital Course created successfully!",
      product: result[0],
    });
  } catch (err: any) {
    console.error("MEDUSA LMS COURSE CREATION ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create digital course in database",
    });
  }
}
