import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { updateProductsWorkflow, deleteProductsWorkflow } from "@medusajs/medusa/core-flows";

interface UpdateCourseInput {
  title?: string;
  description?: string;
  thumbnail?: string;
  trailerUrl?: string;
  priceBdt?: number;
  instructor?: string;
  curriculum?: any[];
  metadata?: Record<string, any>;
  highlights?: Record<string, any>;
  faqs?: any[];
  whatYouWillLearn?: any;
  requirements?: any;
  includes?: any;
}

/**
 * GET /lms/courses/:id
 * Retrieve single course details
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;

  try {
    const productModuleService = req.scope.resolve("product");
    let product;

    // Try finding by ID
    try {
      product = await productModuleService.retrieveProduct(id, {
        relations: ["variants", "options", "images"],
      });
    } catch {
      // Try finding by handle if ID failed
      const [byHandle] = await productModuleService.listProducts(
        { handle: id },
        { relations: ["variants", "options", "images"] }
      );
      product = byHandle;
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (err: any) {
    console.error("GET LMS COURSE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve course",
    });
  }
}

/**
 * POST /lms/courses/:id
 * Update digital masterclass details, curriculum, and LMS metadata
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const body = req.body as UpdateCourseInput;

  try {
    const productModuleService = req.scope.resolve("product");
    
    // Resolve target product
    let targetId = id;
    let existingProduct: any = null;
    try {
      existingProduct = await productModuleService.retrieveProduct(id);
      targetId = existingProduct.id;
    } catch {
      const [byHandle] = await productModuleService.listProducts({ handle: id });
      if (byHandle) {
        existingProduct = byHandle;
        targetId = byHandle.id;
      }
    }

    const updatePayload: any = {
      id: targetId,
    };

    if (body.title) updatePayload.title = body.title.trim();
    if (body.description) updatePayload.description = body.description.trim();
    if (body.thumbnail && !body.thumbnail.startsWith("data:")) {
      updatePayload.thumbnail = body.thumbnail.trim();
    }

    // Preserve and update metadata
    const existingMeta = existingProduct?.metadata || {};
    const incomingMeta = body.metadata || {};

    const metadataUpdates: Record<string, any> = {
      ...existingMeta,
      ...incomingMeta,
      is_digital_course: true,
    };

    if (metadataUpdates.thumbnail && metadataUpdates.thumbnail.startsWith("data:")) {
      metadataUpdates.thumbnail = existingMeta.thumbnail || "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80";
    }
    if (metadataUpdates.image && metadataUpdates.image.startsWith("data:")) {
      metadataUpdates.image = existingMeta.image || metadataUpdates.thumbnail;
    }

    if (body.instructor !== undefined) metadataUpdates.instructor = body.instructor.trim();
    if (body.trailerUrl !== undefined) {
      metadataUpdates.trailer_url = body.trailerUrl.trim();
      metadataUpdates.trailerUrl = body.trailerUrl.trim();
    }
    if (body.curriculum !== undefined) metadataUpdates.curriculum = body.curriculum;
    if (body.highlights !== undefined) metadataUpdates.highlights = body.highlights;
    if (body.faqs !== undefined) metadataUpdates.faqs = body.faqs;
    if (body.whatYouWillLearn !== undefined) metadataUpdates.whatYouWillLearn = body.whatYouWillLearn;
    if (body.requirements !== undefined) metadataUpdates.requirements = body.requirements;
    if (body.includes !== undefined) metadataUpdates.includes = body.includes;

    updatePayload.metadata = metadataUpdates;

    const { result } = await updateProductsWorkflow(req.scope).run({
      input: {
        products: [updatePayload],
      },
    });

    console.log("LMS COURSE UPDATED SUCCESSFULLY:", targetId);

    return res.json({
      success: true,
      message: "Course updated successfully",
      product: result[0],
    });
  } catch (err: any) {
    console.error("UPDATE LMS COURSE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update course",
    });
  }
}

/**
 * DELETE /lms/courses/:id
 * Remove digital masterclass from database
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;

  try {
    const productModuleService = req.scope.resolve("product");

    // Resolve target product
    let targetId = id;
    try {
      const existing = await productModuleService.retrieveProduct(id);
      targetId = existing.id;
    } catch {
      const [byHandle] = await productModuleService.listProducts({ handle: id });
      if (byHandle) {
        targetId = byHandle.id;
      }
    }

    const { result } = await deleteProductsWorkflow(req.scope).run({
      input: {
        ids: [targetId],
      },
    });

    console.log("LMS COURSE DELETED SUCCESSFULLY:", targetId);

    return res.json({
      success: true,
      message: "Course deleted successfully",
      id: targetId,
    });
  } catch (err: any) {
    console.error("DELETE LMS COURSE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to delete course",
    });
  }
}
