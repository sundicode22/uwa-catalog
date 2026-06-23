import { eq } from "drizzle-orm"
import { db, categories, products, stores } from "../lib/db"

const STORE_SLUG = "main-store"

const SEED_PRODUCTS = [
  {
    name: "Classic Leather Tote",
    description: "Hand-stitched full-grain leather tote with interior pockets.",
    price: "129.00",
    image: "1548036328-077292cfe6ca",
    featured: true,
  },
  {
    name: "Wireless Studio Headphones",
    description: "Noise-cancelling over-ear headphones with 30-hour battery life.",
    price: "249.00",
    image: "1505740420928-5e560c06d30e",
    featured: true,
  },
  {
    name: "Urban Runner Sneakers",
    description: "Lightweight knit upper with responsive foam cushioning.",
    price: "98.00",
    image: "1542291026-7eec264c27ff",
  },
  {
    name: "Mirrorless Camera Kit",
    description: "24MP sensor body with 18-55mm lens for everyday shooting.",
    price: "899.00",
    image: "1526170375885-4d8ecf77b99f",
    featured: true,
  },
  {
    name: "Pour-Over Coffee Set",
    description: "Ceramic dripper, glass server, and reusable filter bundle.",
    price: "54.00",
    image: "1495474472287-4d71bcdd2085",
  },
  {
    name: "Monstera Indoor Plant",
    description: "Low-maintenance statement plant in a ceramic pot.",
    price: "42.00",
    image: "1485955909446-ef9dbe986c91",
  },
  {
    name: "Soy Wax Candle",
    description: "Hand-poured cedar and bergamot candle, 45-hour burn.",
    price: "28.00",
    image: "1602874801006-2f9c22d9c8f8",
  },
  {
    name: "Polarized Sunglasses",
    description: "Acetate frames with UV400 polarized lenses.",
    price: "76.00",
    image: "1572635196237-14b3f281503f",
  },
  {
    name: "Travel Backpack",
    description: "Water-resistant daypack with padded laptop sleeve.",
    price: "112.00",
    image: "1553062407-98eeb64c6a62",
  },
  {
    name: "Minimalist Wall Clock",
    description: "Silent quartz movement with matte aluminum face.",
    price: "39.00",
    image: "1563860417049-512d4f6a2f1b",
  },
  {
    name: "Ceramic Dinner Set",
    description: "16-piece stoneware set in soft sand glaze.",
    price: "145.00",
    image: "1578500494198-32694eb7a2db",
  },
  {
    name: "Linen Throw Blanket",
    description: "Breathable stonewashed linen for year-round comfort.",
    price: "88.00",
    image: "1586108761472-69b9a0a4a5b5",
  },
  {
    name: "Stainless Water Bottle",
    description: "Double-wall vacuum insulated 32oz bottle.",
    price: "34.00",
    image: "1602143407151-7111542de6e8",
  },
  {
    name: "Mechanical Keyboard",
    description: "Hot-swappable switches with RGB backlighting.",
    price: "159.00",
    image: "1587829741301-dc798b83f5bd",
  },
  {
    name: "Yoga Mat Pro",
    description: "Non-slip 5mm mat with carrying strap.",
    price: "49.00",
    image: "1601925260368-ae2f83cf8b44",
  },
  {
    name: "Desk Organizer Set",
    description: "Bamboo tray, pen cup, and phone stand trio.",
    price: "36.00",
    image: "1586953208448-b11a79b09dcb",
  },
  {
    name: "Smart Fitness Watch",
    description: "Heart-rate tracking, GPS, and sleep insights.",
    price: "199.00",
    image: "1523275335684-37898b6baf30",
    featured: true,
  },
  {
    name: "Artisan Soap Gift Box",
    description: "Six botanical cold-process bars in kraft packaging.",
    price: "32.00",
    image: "1556228720-195a672e8a03",
  },
  {
    name: "Bluetooth Speaker",
    description: "Compact waterproof speaker with deep bass.",
    price: "79.00",
    image: "1608043152269-423dbba4e7e1",
  },
  {
    name: "Ceramic Mug Pair",
    description: "Hand-glazed mugs with ergonomic handles, set of two.",
    price: "26.00",
    image: "1514228742583-6d9b774b71f5",
  },
] satisfies Array<{
  name: string
  description: string
  price: string
  image: string
  featured?: boolean
}>

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function productImageUrl(slug: string) {
  return `https://picsum.photos/seed/${slug}/800/800`
}

async function fixExistingProducts(storeId: string) {
  const existingProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId))

  for (const [index, product] of existingProducts.entries()) {
    await db
      .update(products)
      .set({
        images: [
          {
            url: productImageUrl(product.slug),
            publicId: `picsum/${product.slug}`,
          },
        ],
        inventory: product.inventory ?? 15 + (index % 36),
        updatedAt: new Date(),
      })
      .where(eq(products.id, product.id))
  }

  console.log(`Updated ${existingProducts.length} existing products.`)
}

async function main() {
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.slug, STORE_SLUG))

  if (!store) {
    throw new Error(`Store not found: ${STORE_SLUG}`)
  }

  const storeCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.storeId, store.id))
    .orderBy(categories.sortOrder)

  if (process.argv.includes("--fix-existing")) {
    await fixExistingProducts(store.id)
    return
  }

  const existing = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.storeId, store.id))

  const existingSlugs = new Set(existing.map((product) => product.slug))

  const rows = SEED_PRODUCTS.map((item, index) => {
    const slug = slugify(item.name)
    const categoryId =
      storeCategories.length > 0
        ? storeCategories[index % storeCategories.length].id
        : null

    return {
      storeId: store.id,
      categoryId,
      name: item.name,
      slug,
      description: item.description,
      price: item.price,
      currency: "USD",
      images: [
        {
          url: productImageUrl(slug),
          publicId: `picsum/${slug}`,
        },
      ],
      inventory: 15 + (index % 36),
      isActive: true,
      isFeatured: item.featured ?? false,
      sortOrder: index,
    }
  }).filter((row) => !existingSlugs.has(row.slug))

  if (rows.length === 0) {
    console.log(`All ${SEED_PRODUCTS.length} seed products already exist for ${STORE_SLUG}.`)
    return
  }

  await db.insert(products).values(rows)

  console.log(`Seeded ${rows.length} products for store "${store.name}" (${STORE_SLUG}).`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
