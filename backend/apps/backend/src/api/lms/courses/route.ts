import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * Headless LMS Course Catalog Endpoint
 * Returns all published digital masterclasses
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const productModuleService = req.scope.resolve("product");
    const products = await productModuleService.listProducts(
      { status: "published" as any },
      {
        relations: ["variants", "options", "images"],
        take: 50,
      }
    );

    return res.json({
      success: true,
      courses: products,
      count: products.length,
    });
  } catch (err: any) {
    console.error("MEDUSA LMS LIST ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to list courses",
      courses: [],
    });
  }
}
