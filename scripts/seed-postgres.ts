import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  try {
    const filePath = path.join(process.cwd(), "lib", "data", filename);
    const raw = await fs.readFile(filePath, "utf-8");
    if (raw && raw.trim()) {
      return JSON.parse(raw) as T;
    }
  } catch (err: any) {
    // Check storage/data fallback
    try {
      const storagePath = path.join(process.cwd(), "storage", "data", filename);
      const raw = await fs.readFile(storagePath, "utf-8");
      if (raw && raw.trim()) {
        return JSON.parse(raw) as T;
      }
    } catch {}
  }
  return fallback;
}

async function main() {
  console.log("==================================================");
  console.log("🚀 Starting Data Seeding to PostgreSQL...");
  console.log("==================================================");

  try {
    await prisma.$connect();
    console.log("✅ Successfully connected to PostgreSQL.");
  } catch (err: any) {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  }

  // 1. Seed Users & Customers
  console.log("\n📦 [1/6] Seeding Users & Customers...");
  const customers = await readJsonFile<any[]>("customers.json", []);
  let userCount = 0;
  for (const c of customers) {
    if (!c.email) continue;
    try {
      await prisma.user.upsert({
        where: { email: c.email.toLowerCase().trim() },
        update: {
          firstName: c.first_name || c.firstName || "",
          lastName: c.last_name || c.lastName || "",
          phone: c.phone || "",
          role: c.role || "student",
          status: c.status || "active",
          banReason: c.banReason || null,
          tempBanUntil: c.tempBanUntil || null,
          customEnrolledSlugs: Array.isArray(c.customEnrolledSlugs) ? c.customEnrolledSlugs : [],
          revokedSlugs: Array.isArray(c.revokedSlugs) ? c.revokedSlugs : [],
          notices: Array.isArray(c.notices) ? c.notices : [],
        },
        create: {
          email: c.email.toLowerCase().trim(),
          firstName: c.first_name || c.firstName || "",
          lastName: c.last_name || c.lastName || "",
          phone: c.phone || "",
          role: c.role || "student",
          status: c.status || "active",
          banReason: c.banReason || null,
          tempBanUntil: c.tempBanUntil || null,
          customEnrolledSlugs: Array.isArray(c.customEnrolledSlugs) ? c.customEnrolledSlugs : [],
          revokedSlugs: Array.isArray(c.revokedSlugs) ? c.revokedSlugs : [],
          notices: Array.isArray(c.notices) ? c.notices : [],
        },
      });
      userCount++;
    } catch (e: any) {
      console.warn(`   ⚠️ Warning seeding user ${c.email}:`, e.message);
    }
  }
  console.log(`   -> Successfully upserted ${userCount} users.`);

  // 2. Seed Instructors
  console.log("\n📦 [2/6] Seeding Instructors...");
  const instructors = await readJsonFile<any[]>("instructors.json", []);
  let instCount = 0;
  for (const inst of instructors) {
    const id = inst.id || (inst.name ? inst.name.toLowerCase().replace(/\s+/g, "-") : "instructor-1");
    try {
      await prisma.instructor.upsert({
        where: { id },
        update: {
          name: inst.name || "Sakil Ahmed",
          role: inst.role || "Lead Instructor",
          avatar: inst.avatar || "",
          experience: inst.experience || "8+ Years",
          projects: inst.projects || "400+",
          students: inst.students || "10K+",
          bio: inst.bio || "",
          socials: inst.socials || {},
          courseSlugs: Array.isArray(inst.courseSlugs) ? inst.courseSlugs : [],
          courses: Array.isArray(inst.courses) ? inst.courses : [],
        },
        create: {
          id,
          name: inst.name || "Sakil Ahmed",
          role: inst.role || "Lead Instructor",
          avatar: inst.avatar || "",
          experience: inst.experience || "8+ Years",
          projects: inst.projects || "400+",
          students: inst.students || "10K+",
          bio: inst.bio || "",
          socials: inst.socials || {},
          courseSlugs: Array.isArray(inst.courseSlugs) ? inst.courseSlugs : [],
          courses: Array.isArray(inst.courses) ? inst.courses : [],
        },
      });
      instCount++;
    } catch (e: any) {
      console.warn(`   ⚠️ Warning seeding instructor ${id}:`, e.message);
    }
  }
  console.log(`   -> Successfully upserted ${instCount} instructors.`);

  // 3. Seed Courses & Overrides
  console.log("\n📦 [3/6] Seeding Courses & CMS Overrides...");
  const coursesCms = await readJsonFile<Record<string, any>>("courses-cms.json", {});
  let courseCount = 0;

  // Initial seed courses
  const initialCourses = [
    {
      slug: "artbase-editing",
      title: "Artbase Commercial Video Editing Masterclass",
      subtitle: "Master high-end commercial video editing, cinematic transitions, color grading, and client acquisition workflows from zero to pro.",
      badge: "Bestseller",
      category: "Video Editing",
      rating: 4.9,
      reviewsCount: "142",
      studentsCount: "1.2K+ Enrolled",
      updatedDate: "March 2026",
      level: "Beginner to Pro",
      price: "1299",
      originalPrice: "2858",
      discountPct: "55% OFF",
      numericPrice: 1299,
      numericOriginalPrice: 2858,
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
      thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
      trailerImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
      trailerVideo: "https://youtube.com/watch?v=demo",
      instructorId: "sakil-ahmed",
      instructorName: "Sakil Ahmed",
      status: "published",
    },
    {
      slug: "motion-graphics-pro",
      title: "Advanced Motion Graphics & Visual Effects",
      subtitle: "Create viral animations, kinetic typography, 3D camera projections, and commercial VFX using After Effects.",
      badge: "Featured",
      category: "Motion Graphics",
      rating: 5.0,
      reviewsCount: "98",
      studentsCount: "850+ Enrolled",
      updatedDate: "March 2026",
      level: "Intermediate to Pro",
      price: "1599",
      originalPrice: "3499",
      discountPct: "54% OFF",
      numericPrice: 1599,
      numericOriginalPrice: 3499,
      image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80",
      thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80",
      trailerImage: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80",
      trailerVideo: "https://youtube.com/watch?v=demo",
      instructorId: "sakil-ahmed",
      instructorName: "Sakil Ahmed",
      status: "published",
    },
  ];

  for (const baseCourse of initialCourses) {
    const override = coursesCms[baseCourse.slug] || {};
    try {
      await prisma.course.upsert({
        where: { slug: baseCourse.slug },
        update: {
          title: override.title || baseCourse.title,
          subtitle: override.subtitle || baseCourse.subtitle,
          badge: override.badge || baseCourse.badge,
          category: override.category || baseCourse.category,
          numericPrice: override.numericPrice ?? baseCourse.numericPrice,
          numericOriginalPrice: override.numericOriginalPrice ?? baseCourse.numericOriginalPrice,
          discountPct: override.discountPct || baseCourse.discountPct,
          instructorId: override.instructorId || baseCourse.instructorId,
          instructorName: override.instructorName || baseCourse.instructorName,
          highlights: override.highlights || {},
          faqs: override.faqs || [],
          curriculum: override.curriculum || [],
        },
        create: {
          ...baseCourse,
          title: override.title || baseCourse.title,
          subtitle: override.subtitle || baseCourse.subtitle,
          badge: override.badge || baseCourse.badge,
          category: override.category || baseCourse.category,
          numericPrice: override.numericPrice ?? baseCourse.numericPrice,
          numericOriginalPrice: override.numericOriginalPrice ?? baseCourse.numericOriginalPrice,
          discountPct: override.discountPct || baseCourse.discountPct,
          instructorId: override.instructorId || baseCourse.instructorId,
          instructorName: override.instructorName || baseCourse.instructorName,
          highlights: override.highlights || {},
          faqs: override.faqs || [],
          curriculum: override.curriculum || [],
        },
      });
      courseCount++;
    } catch (e: any) {
      console.warn(`   ⚠️ Warning seeding course ${baseCourse.slug}:`, e.message);
    }
  }

  // Also seed any other courses in courses-cms
  for (const [slug, override] of Object.entries(coursesCms)) {
    if (initialCourses.some((c) => c.slug === slug)) continue;
    try {
      await prisma.course.upsert({
        where: { slug },
        update: {
          title: override.title || slug.replace(/-/g, " "),
          subtitle: override.subtitle || "",
          badge: override.badge || "Featured",
          category: override.category || "Video Editing",
          numericPrice: override.numericPrice || 1299,
          numericOriginalPrice: override.numericOriginalPrice || 2858,
          discountPct: override.discountPct || "",
          instructorId: override.instructorId || "sakil-ahmed",
          instructorName: override.instructorName || "Sakil Ahmed",
          highlights: override.highlights || {},
          faqs: override.faqs || [],
          curriculum: override.curriculum || [],
        },
        create: {
          slug,
          title: override.title || slug.replace(/-/g, " "),
          subtitle: override.subtitle || "",
          badge: override.badge || "Featured",
          category: override.category || "Video Editing",
          numericPrice: override.numericPrice || 1299,
          numericOriginalPrice: override.numericOriginalPrice || 2858,
          discountPct: override.discountPct || "",
          instructorId: override.instructorId || "sakil-ahmed",
          instructorName: override.instructorName || "Sakil Ahmed",
          highlights: override.highlights || {},
          faqs: override.faqs || [],
          curriculum: override.curriculum || [],
          status: "published",
        },
      });
      courseCount++;
    } catch (e: any) {
      console.warn(`   ⚠️ Warning seeding course ${slug}:`, e.message);
    }
  }
  console.log(`   -> Successfully upserted ${courseCount} courses.`);

  // 4. Seed Orders
  console.log("\n📦 [4/6] Seeding Orders...");
  const orders = await readJsonFile<any[]>("orders.json", []);
  let orderCount = 0;
  for (const o of orders) {
    if (!o.orderNumber && !o.id) continue;
    const orderNo = o.orderNumber || o.id;
    try {
      await prisma.order.upsert({
        where: { orderNumber: orderNo },
        update: {
          studentName: o.studentName || o.student_name || "Student",
          email: (o.email || "").toLowerCase().trim(),
          courseTitle: o.courseTitle || o.course_title || "",
          courseSlug: o.courseSlug || o.course_slug || "",
          amount: Number(o.amount) || 0,
          paymentMethod: o.paymentMethod || o.payment_method || "bKash",
          senderNumber: o.senderNumber || o.sender_number || "",
          trxId: o.trxId || o.trx_id || "",
          status: o.status || "pending_verification",
          rejectionReason: o.rejectionReason || null,
        },
        create: {
          orderNumber: orderNo,
          studentName: o.studentName || o.student_name || "Student",
          email: (o.email || "").toLowerCase().trim(),
          courseTitle: o.courseTitle || o.course_title || "",
          courseSlug: o.courseSlug || o.course_slug || "",
          amount: Number(o.amount) || 0,
          paymentMethod: o.paymentMethod || o.payment_method || "bKash",
          senderNumber: o.senderNumber || o.sender_number || "",
          trxId: o.trxId || o.trx_id || "",
          status: o.status || "pending_verification",
          rejectionReason: o.rejectionReason || null,
        },
      });
      orderCount++;
    } catch (e: any) {
      console.warn(`   ⚠️ Warning seeding order ${orderNo}:`, e.message);
    }
  }
  console.log(`   -> Successfully upserted ${orderCount} orders.`);

  // 5. Seed Shop Products
  console.log("\n📦 [5/6] Seeding Shop Digital Products...");
  const shopData = await readJsonFile<any[]>("shop.json", []);
  let shopCount = 0;
  for (const item of shopData) {
    if (!item.slug && !item.id) continue;
    const slug = item.slug || item.id;
    try {
      await prisma.shopProduct.upsert({
        where: { slug },
        update: {
          title: item.title || "Digital Asset",
          category: item.category || "LUTs & Presets",
          shortDescription: item.shortDescription || item.description || "",
          fullDescription: item.fullDescription || item.description || "",
          price: Number(item.price) || 499,
          originalPrice: Number(item.originalPrice) || 999,
          discountBadge: item.discountBadge || "",
          thumbnail: item.thumbnail || item.image || "",
          images: Array.isArray(item.images) ? item.images : [],
          badge: item.badge || "Popular",
          features: Array.isArray(item.features) ? item.features : [],
          deliveryMethod: item.deliveryMethod || { type: "instant_download" },
          stock: item.stock || "unlimited",
          status: item.status || "active",
        },
        create: {
          slug,
          title: item.title || "Digital Asset",
          category: item.category || "LUTs & Presets",
          shortDescription: item.shortDescription || item.description || "",
          fullDescription: item.fullDescription || item.description || "",
          price: Number(item.price) || 499,
          originalPrice: Number(item.originalPrice) || 999,
          discountBadge: item.discountBadge || "",
          thumbnail: item.thumbnail || item.image || "",
          images: Array.isArray(item.images) ? item.images : [],
          badge: item.badge || "Popular",
          features: Array.isArray(item.features) ? item.features : [],
          deliveryMethod: item.deliveryMethod || { type: "instant_download" },
          stock: item.stock || "unlimited",
          status: item.status || "active",
        },
      });
      shopCount++;
    } catch (e: any) {
      console.warn(`   ⚠️ Warning seeding shop product ${slug}:`, e.message);
    }
  }
  console.log(`   -> Successfully upserted ${shopCount} shop products.`);

  // 6. Seed Platform Settings & Branding
  console.log("\n📦 [6/6] Seeding Platform Settings & Branding...");
  const branding = await readJsonFile<any>("branding.json", null);
  if (branding) {
    await prisma.platformSetting.upsert({
      where: { key: "branding" },
      update: { value: branding },
      create: { key: "branding", value: branding },
    });
  }

  const homeCms = await readJsonFile<any>("home-cms.json", null);
  if (homeCms) {
    await prisma.platformSetting.upsert({
      where: { key: "home_cms" },
      update: { value: homeCms },
      create: { key: "home_cms", value: homeCms },
    });
  }

  const aboutCms = await readJsonFile<any>("about-cms.json", null);
  if (aboutCms) {
    await prisma.platformSetting.upsert({
      where: { key: "about_cms" },
      update: { value: aboutCms },
      create: { key: "about_cms", value: aboutCms },
    });
  }
  console.log("   -> Successfully upserted platform settings.");

  console.log("\n==================================================");
  console.log("🎉 Database seeding completed successfully!");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("FATAL ERROR IN SEED SCRIPT:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
