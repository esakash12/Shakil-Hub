import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

async function cleanJsonFile(relativePath: string, emptyContent: string) {
  try {
    const fullPath = path.join(process.cwd(), relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, emptyContent, "utf-8");
    console.log(`   🧹 Cleared fallback file: ${relativePath}`);
  } catch (err: any) {}
}

async function main() {
  console.log("==================================================");
  console.log("🧹 Sakil Hub: Complete Clean-Slate Database Reset");
  console.log("==================================================");
  console.log("🔒 Credentials Preserved: Cloudflare R2, DB URL, Admin Auth, Branding.\n");

  try {
    await prisma.$connect();
    console.log("✅ Successfully connected to PostgreSQL.");
  } catch (err: any) {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  }

  // 1. Wipe Orders & Enrollments
  console.log("\n🗑️ [1/7] Wiping Orders & Verification Records...");
  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`   -> Deleted ${deletedOrders.count} orders.`);

  // 2. Wipe Classroom Progress, Interactions & Certificates
  console.log("\n🗑️ [2/7] Wiping Student Progress, Certificates & Notes...");
  const deletedProgress = await prisma.courseProgress.deleteMany({});
  const deletedCerts = await prisma.certificate.deleteMany({});
  const deletedInteractions = await prisma.classroomInteraction.deleteMany({});
  console.log(`   -> Deleted ${deletedProgress.count} progress records.`);
  console.log(`   -> Deleted ${deletedCerts.count} certificates.`);
  console.log(`   -> Deleted ${deletedInteractions.count} classroom notes/QA.`);

  // 3. Wipe Courses
  console.log("\n🗑️ [3/7] Wiping Masterclasses & Courses...");
  const deletedCourses = await prisma.course.deleteMany({});
  console.log(`   -> Deleted ${deletedCourses.count} courses.`);

  // 4. Wipe Shop Products
  console.log("\n🗑️ [4/7] Wiping Digital Shop Products...");
  const deletedProducts = await prisma.shopProduct.deleteMany({});
  console.log(`   -> Deleted ${deletedProducts.count} shop products.`);

  // 5. Wipe Student Users
  console.log("\n🗑️ [5/7] Wiping Student User Accounts...");
  const deletedUsers = await prisma.user.deleteMany({});
  console.log(`   -> Deleted ${deletedUsers.count} users.`);

  // 6. Reset Instructor Course Associations (Keep Sakil Ahmed profile ready)
  console.log("\n👤 [6/7] Resetting Instructor Course Associations...");
  await prisma.instructor.upsert({
    where: { id: "sakil-ahmed" },
    update: {
      courseSlugs: [],
      courses: [],
    },
    create: {
      id: "sakil-ahmed",
      name: "Sakil Ahmed",
      role: "Lead Filmmaker & Video Editor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      experience: "8+ Years",
      projects: "400+",
      students: "10K+",
      bio: "Professional filmmaker and video editing mentor helping creators build high-ticket client businesses.",
      socials: {
        youtube: "https://youtube.com/@sakilahmed",
        facebook: "https://facebook.com/sakilahmed",
      },
      courseSlugs: [],
      courses: [],
    },
  });
  console.log("   -> Instructor profile initialized with 0 courses assigned.");

  // 7. Clear Ghost JSON Fallback Files
  console.log("\n🧹 [7/7] Clearing Local JSON Fallback Files...");
  await cleanJsonFile("lib/data/customers.json", "[]");
  await cleanJsonFile("lib/data/orders.json", "[]");
  await cleanJsonFile("lib/data/courses-cms.json", "{}");
  await cleanJsonFile("lib/data/shop.json", "[]");
  await cleanJsonFile("storage/data/customers.json", "[]");
  await cleanJsonFile("storage/data/orders.json", "[]");
  await cleanJsonFile("storage/data/courses-cms.json", "{}");
  await cleanJsonFile("storage/data/shop.json", "[]");

  console.log("\n==================================================");
  console.log("✨ Clean-Slate Reset Completed Successfully!");
  console.log("   - 0 Courses in Catalog");
  console.log("   - 0 Digital Products in Shop");
  console.log("   - 0 Registered Student Accounts");
  console.log("   - 0 Orders or Processing Records");
  console.log("   - Cloudflare R2 & Platform Credentials Intact");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Clean-slate script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
