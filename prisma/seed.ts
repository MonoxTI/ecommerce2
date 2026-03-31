// prisma/seed.ts
// Run with: npx ts-node prisma/seed.ts
// Or add to package.json: "prisma": { "seed": "ts-node prisma/seed.ts" }
// Then run: npx prisma db seed
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DIRECT_URL!,
});

const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ────────────────────────────────────────────
  const adminEmail = "itu@gmail.com";
  const existing   = await db.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    await db.user.create({
      data: {
        name:     "Itumeleng Monox",
        email:    adminEmail,
        password: await bcrypt.hash("Itumeleng1#", 12),
        phone:    "0110001234",
        role:     "ADMIN",
      },
    });
    console.log("✅ Admin user created — email: admin@aurawig.co.za  password: Admin@1234");
  } else {
    console.log("⏭  Admin user already exists");
  }

  // ── Categories ────────────────────────────────────────────
  const categoryData = [
    { name: "Lace Front Wigs",  slug: "lace-front-wigs"  },
    { name: "HD Lace Wigs",     slug: "hd-lace-wigs"     },
    { name: "Full Lace Wigs",   slug: "full-lace-wigs"   },
    { name: "Closure Wigs",     slug: "closure-wigs"     },
    { name: "Glueless Wigs",    slug: "glueless-wigs"    },
  ];

  const categories: Record<string, string> = {};

  for (const cat of categoryData) {
    const c = await db.category.upsert({
      where:  { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = c.id;
    console.log(`✅ Category: ${cat.name}`);
  }

  // ── Products ──────────────────────────────────────────────

  const products = [
    // ── LACE FRONT ───────────────────────────────────────
    {
      categorySlug: "lace-front-wigs",
      name:         "Body Wave 13×4 Lace Front",
      slug:         "body-wave-13x4-lace-front",
      description:  "Our best-selling Body Wave Lace Front wig crafted from 100% virgin human hair. The 13×4 transparent lace creates a seamless, natural-looking hairline. Perfect for beginners and seasoned wig wearers alike. Pre-plucked with baby hairs for an effortless install.",
      brand:        "AuraWig",
      images: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
        "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80",
      ],
      variants: [
        { sku: "BW-13x4-NB-16", price: 169900, stock: 12, color: "Natural Black", length: "16", density: "150%", laceType: "13x4", capSize: "Medium" },
        { sku: "BW-13x4-NB-18", price: 189900, stock: 15, color: "Natural Black", length: "18", density: "150%", laceType: "13x4", capSize: "Medium" },
        { sku: "BW-13x4-NB-20", price: 209900, stock: 10, color: "Natural Black", length: "20", density: "150%", laceType: "13x4", capSize: "Medium" },
        { sku: "BW-13x4-NB-22", price: 229900, stock: 8,  color: "Natural Black", length: "22", density: "180%", laceType: "13x4", capSize: "Medium" },
        { sku: "BW-13x4-DB-18", price: 189900, stock: 6,  color: "Dark Brown",    length: "18", density: "150%", laceType: "13x4", capSize: "Medium" },
        { sku: "BW-13x4-DB-20", price: 209900, stock: 4,  color: "Dark Brown",    length: "20", density: "150%", laceType: "13x4", capSize: "Medium" },
      ],
    },
    {
      categorySlug: "lace-front-wigs",
      name:         "Straight Silky 13×6 Lace Front",
      slug:         "straight-silky-13x6-lace-front",
      description:  "Achieve salon-sleek perfection with our Straight Silky Lace Front. The wider 13×6 lace allows for deeper parting versatility. 100% virgin human hair that can be dyed, bleached, and heat-styled. The silk-straight texture maintains its shape beautifully.",
      brand:        "AuraWig",
      images: [
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
      ],
      variants: [
        { sku: "ST-13x6-NB-18", price: 199900, stock: 10, color: "Natural Black", length: "18", density: "150%", laceType: "13x6", capSize: "Medium" },
        { sku: "ST-13x6-NB-20", price: 219900, stock: 8,  color: "Natural Black", length: "20", density: "150%", laceType: "13x6", capSize: "Medium" },
        { sku: "ST-13x6-NB-24", price: 259900, stock: 5,  color: "Natural Black", length: "24", density: "180%", laceType: "13x6", capSize: "Medium" },
        { sku: "ST-13x6-JB-20", price: 219900, stock: 7,  color: "Jet Black",     length: "20", density: "150%", laceType: "13x6", capSize: "Medium" },
      ],
    },

    // ── HD LACE ──────────────────────────────────────────
    {
      categorySlug: "hd-lace-wigs",
      name:         "Deep Wave HD Lace Wig",
      slug:         "deep-wave-hd-lace",
      description:  "Experience the pinnacle of luxury with our Deep Wave HD Lace Wig. The ultra-thin Swiss HD lace melts seamlessly into any skin tone — truly undetectable even up close. The deep wave pattern adds irresistible volume and bounce. Pre-plucked hairline with baby hairs.",
      brand:        "AuraWig",
      images: [
        "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
      ],
      variants: [
        { sku: "DW-HD-NB-18", price: 249900, stock: 8,  color: "Natural Black", length: "18", density: "150%", laceType: "HD Lace", capSize: "Medium" },
        { sku: "DW-HD-NB-20", price: 279900, stock: 6,  color: "Natural Black", length: "20", density: "150%", laceType: "HD Lace", capSize: "Medium" },
        { sku: "DW-HD-NB-22", price: 309900, stock: 4,  color: "Natural Black", length: "22", density: "180%", laceType: "HD Lace", capSize: "Medium" },
        { sku: "DW-HD-NB-24", price: 349900, stock: 3,  color: "Natural Black", length: "24", density: "180%", laceType: "HD Lace", capSize: "Medium" },
        { sku: "DW-HD-DB-20", price: 279900, stock: 5,  color: "Dark Brown",    length: "20", density: "150%", laceType: "HD Lace", capSize: "Medium" },
      ],
    },
    {
      categorySlug: "hd-lace-wigs",
      name:         "Loose Wave HD Lace Wig",
      slug:         "loose-wave-hd-lace",
      description:  "The Loose Wave HD Lace Wig offers effortless beach waves that look naturally grown. Our HD lace technology ensures a flawless, undetectable hairline. 100% virgin Brazilian human hair with lasting wave pattern. Lightweight and breathable — perfect for all-day wear.",
      brand:        "AuraWig",
      images: [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
      ],
      variants: [
        { sku: "LW-HD-NB-16", price: 229900, stock: 10, color: "Natural Black", length: "16", density: "150%", laceType: "HD Lace", capSize: "Medium" },
        { sku: "LW-HD-NB-18", price: 249900, stock: 8,  color: "Natural Black", length: "18", density: "150%", laceType: "HD Lace", capSize: "Medium" },
        { sku: "LW-HD-NB-20", price: 269900, stock: 6,  color: "Natural Black", length: "20", density: "180%", laceType: "HD Lace", capSize: "Medium" },
        { sku: "LW-HD-HB-18", price: 249900, stock: 4,  color: "Honey Brown",   length: "18", density: "150%", laceType: "HD Lace", capSize: "Medium" },
      ],
    },

    // ── FULL LACE ────────────────────────────────────────
    {
      categorySlug: "full-lace-wigs",
      name:         "Straight Full Lace Wig",
      slug:         "straight-full-lace",
      description:  "The ultimate in versatility — our Straight Full Lace Wig allows you to part anywhere, style in high ponytails, updos, and more. Handcrafted with 100% virgin human hair on a full lace cap. The silky straight texture holds beautifully and blends seamlessly.",
      brand:        "AuraWig",
      images: [
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
      ],
      variants: [
        { sku: "SF-FL-NB-18", price: 329900, stock: 5,  color: "Natural Black", length: "18", density: "150%", laceType: "Full Lace", capSize: "Medium" },
        { sku: "SF-FL-NB-20", price: 369900, stock: 4,  color: "Natural Black", length: "20", density: "150%", laceType: "Full Lace", capSize: "Medium" },
        { sku: "SF-FL-NB-22", price: 409900, stock: 3,  color: "Natural Black", length: "22", density: "180%", laceType: "Full Lace", capSize: "Medium" },
        { sku: "SF-FL-NB-24", price: 449900, stock: 2,  color: "Natural Black", length: "24", density: "180%", laceType: "Full Lace", capSize: "Large"  },
      ],
    },

    // ── CLOSURE ──────────────────────────────────────────
    {
      categorySlug: "closure-wigs",
      name:         "Body Wave 4×4 Closure Wig",
      slug:         "body-wave-4x4-closure",
      description:  "Our 4×4 Lace Closure Wig delivers a natural look with a smaller lace area for easy application. Ideal for those new to wigs or wanting a quick, fuss-free install. 100% virgin human hair with a beautiful body wave pattern. Beginner-friendly and full of volume.",
      brand:        "AuraWig",
      images: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
      ],
      variants: [
        { sku: "BW-4x4-NB-16", price: 149900, stock: 15, color: "Natural Black", length: "16", density: "150%", laceType: "4x4", capSize: "Medium" },
        { sku: "BW-4x4-NB-18", price: 169900, stock: 12, color: "Natural Black", length: "18", density: "150%", laceType: "4x4", capSize: "Medium" },
        { sku: "BW-4x4-NB-20", price: 189900, stock: 10, color: "Natural Black", length: "20", density: "150%", laceType: "4x4", capSize: "Medium" },
        { sku: "BW-4x4-NB-22", price: 209900, stock: 6,  color: "Natural Black", length: "22", density: "180%", laceType: "4x4", capSize: "Medium" },
        { sku: "BW-4x4-DB-18", price: 169900, stock: 8,  color: "Dark Brown",    length: "18", density: "150%", laceType: "4x4", capSize: "Medium" },
      ],
    },

    // ── GLUELESS ─────────────────────────────────────────
    {
      categorySlug: "glueless-wigs",
      name:         "Kinky Curly Glueless Wig",
      slug:         "kinky-curly-glueless",
      description:  "Embrace your natural texture with our Kinky Curly Glueless Wig. No glue, no gel — just clip in and go. Fitted with adjustable straps and combs for a secure hold all day. 100% virgin human hair that can be washed and restyled repeatedly. Perfect for protective styling.",
      brand:        "AuraWig",
      images: [
        "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80",
      ],
      variants: [
        { sku: "KC-GL-NB-14", price: 179900, stock: 10, color: "Natural Black", length: "14", density: "150%", laceType: "HD Lace", capSize: "Medium" },
        { sku: "KC-GL-NB-16", price: 199900, stock: 8,  color: "Natural Black", length: "16", density: "150%", laceType: "HD Lace", capSize: "Medium" },
        { sku: "KC-GL-NB-18", price: 219900, stock: 6,  color: "Natural Black", length: "18", density: "150%", laceType: "HD Lace", capSize: "Medium" },
        { sku: "KC-GL-NB-20", price: 239900, stock: 4,  color: "Natural Black", length: "20", density: "180%", laceType: "HD Lace", capSize: "Medium" },
      ],
    },

    // ── COLOURED ─────────────────────────────────────────
    {
      categorySlug: "lace-front-wigs",
      name:         "Honey Blonde Body Wave Lace Front",
      slug:         "honey-blonde-body-wave",
      description:  "Turn heads with our stunning Honey Blonde Body Wave. The warm, golden tones are achieved through our expert colouring process on 100% virgin human hair — no damage, no compromise on quality. The body wave pattern flows effortlessly for a glamorous, head-turning look.",
      brand:        "AuraWig",
      images: [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
      ],
      variants: [
        { sku: "BW-13x4-HB-16", price: 219900, stock: 8,  color: "Honey Blonde", length: "16", density: "150%", laceType: "13x4", capSize: "Medium" },
        { sku: "BW-13x4-HB-18", price: 239900, stock: 6,  color: "Honey Blonde", length: "18", density: "150%", laceType: "13x4", capSize: "Medium" },
        { sku: "BW-13x4-HB-20", price: 259900, stock: 5,  color: "Honey Blonde", length: "20", density: "150%", laceType: "13x4", capSize: "Medium" },
        { sku: "BW-13x4-HB-22", price: 289900, stock: 3,  color: "Honey Blonde", length: "22", density: "180%", laceType: "13x4", capSize: "Medium" },
      ],
    },
  ];

  for (const p of products) {
    const exists = await db.product.findUnique({ where: { slug: p.slug } });
    if (exists) { console.log(`⏭  Product already exists: ${p.name}`); continue; }

    const product = await db.product.create({
      data: {
        name:        p.name,
        slug:        p.slug,
        description: p.description,
        brand:       p.brand,
        categoryId:  categories[p.categorySlug],
        images: {
          create: p.images.map(url => ({ url })),
        },
        variants: {
          create: p.variants,
        },
      },
    });

    console.log(`✅ Product: ${p.name} (${p.variants.length} variants)`);
  }

  // ── Coupons ──────────────────────────────────────────────
  const coupons = [
    { code: "WELCOME10", discount: 10,    type: "PERCENTAGE" as const, active: true },
    { code: "SAVE200",   discount: 20000, type: "FIXED"      as const, active: true, minOrder: 100000 },
    { code: "VIP15",     discount: 15,    type: "PERCENTAGE" as const, active: true, minOrder: 150000 },
  ];

  for (const coupon of coupons) {
    await db.coupon.upsert({
      where:  { code: coupon.code },
      update: {},
      create: coupon,
    });
    console.log(`✅ Coupon: ${coupon.code}`);
  }

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────");
  console.log("Admin login:");
  console.log("  Email:    itu@gmail.com");
  console.log("  Password: Itumeleng1#");
  console.log("\nCoupons:");
  console.log("  WELCOME10 — 10% off any order");
  console.log("  SAVE200   — R200 off orders over R1,000");
  console.log("  VIP15     — 15% off orders over R1,500");
}

main()
  .catch(e => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => db.$disconnect());