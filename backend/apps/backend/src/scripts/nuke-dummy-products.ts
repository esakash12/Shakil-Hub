import { ExecArgs } from "@medusajs/framework/types";

/**
 * Script to delete seeded physical demo products from Medusa database
 */
export default async function nukeDummyProducts({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const productModuleService = container.resolve("product");

  logger.info("Purging seeded demo products from database...");

  try {
    const products = await productModuleService.listProducts({});
    logger.info(`Found ${products.length} products in database.`);

    const demoHandles = [
      "sweatshirt",
      "t-shirt",
      "mug",
      "hoodie",
      "cap",
      "poster",
      "medusa-sweatshirt",
      "medusa-t-shirt",
      "medusa-mug",
    ];

    const toDelete = products
      .filter((p) => {
        const handle = p.handle?.toLowerCase() || "";
        const title = p.title?.toLowerCase() || "";
        return (
          demoHandles.some((d) => handle.includes(d) || title.includes(d)) ||
          !title.includes("masterclass")
        );
      })
      .map((p) => p.id);

    if (toDelete.length > 0) {
      await productModuleService.deleteProducts(toDelete);
      logger.info(`Successfully purged ${toDelete.length} physical dummy products.`);
    } else {
      logger.info("No physical demo products found to delete.");
    }
  } catch (err: any) {
    logger.error(`Error deleting products: ${err.message}`);
  }
}
