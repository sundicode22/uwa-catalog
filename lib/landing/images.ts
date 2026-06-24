/** Simple product photos for landing page visuals (Unsplash + Pexels). */
export function landingImage(ref: string, width: number, height = width) {
  if (ref.startsWith("pexels:")) {
    const id = ref.slice("pexels:".length)
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`
  }

  return `https://images.unsplash.com/photo-${ref}?w=${width}&h=${height}&fit=crop&q=80&auto=format`
}

export const LANDING_PRODUCTS = [
  {
    name: "Classic Leather Tote",
    price: "$129",
    imageId: "1434389677669-e08b4cac3105",
  },
  {
    name: "Wireless Headphones",
    price: "$249",
    imageId: "1505740420928-5e560c06d30e",
  },
  {
    name: "Urban Runner Sneakers",
    price: "$98",
    imageId: "1542291026-7eec264c27ff",
  },
  {
    name: "Pour-Over Coffee Set",
    price: "$54",
    imageId: "1495474472287-4d71bcdd2085",
  },
  {
    name: "Ceramic Mug Pair",
    price: "$26",
    imageId: "1611262588024-d12430b98920",
  },
  {
    name: "Bluetooth Speaker",
    price: "$79",
    imageId: "1608043152269-423dbba4e7e1",
  },
  {
    name: "Polarized Sunglasses",
    price: "$76",
    imageId: "1572635196237-14b3f281503f",
  },
  {
    name: "Soy Wax Candle",
    price: "$28",
    imageId: "pexels:7264942",
  },
  {
    name: "Stainless Water Bottle",
    price: "$34",
    imageId: "1602143407151-7111542de6e8",
  },
  {
    name: "Artisan Soap Gift Box",
    price: "$32",
    imageId: "1556228720-195a672e8a03",
  },
  {
    name: "Ceramic Dinner Set",
    price: "$145",
    imageId: "1578662996442-48f60103fc96",
  },
  {
    name: "Smart Fitness Watch",
    price: "$199",
    imageId: "1523275335684-37898b6baf30",
  },
  {
    name: "Travel Backpack",
    price: "$112",
    imageId: "1553062407-98eeb64c6a62",
  },
  {
    name: "Linen Throw Blanket",
    price: "$88",
    imageId: "pexels:373125",
  },
  {
    name: "Yoga Mat",
    price: "$49",
    imageId: "pexels:4056723",
  },
] as const

export const LANDING_PREVIEW_PRODUCTS = LANDING_PRODUCTS.slice(0, 6)

export const LANDING_GALLERY_IMAGES = [
  {
    imageId: LANDING_PRODUCTS[0].imageId,
    alt: LANDING_PRODUCTS[0].name,
    className: "md:col-span-2 md:row-span-2",
  },
  {
    imageId: LANDING_PRODUCTS[3].imageId,
    alt: LANDING_PRODUCTS[3].name,
    className: "md:col-span-1",
  },
  {
    imageId: LANDING_PRODUCTS[4].imageId,
    alt: LANDING_PRODUCTS[4].name,
    className: "md:col-span-1",
  },
  {
    imageId: LANDING_PRODUCTS[2].imageId,
    alt: LANDING_PRODUCTS[2].name,
    className: "md:col-span-1",
  },
  {
    imageId: LANDING_PRODUCTS[7].imageId,
    alt: LANDING_PRODUCTS[7].name,
    className: "md:col-span-1",
  },
  {
    imageId: LANDING_PRODUCTS[1].imageId,
    alt: LANDING_PRODUCTS[1].name,
    className: "md:col-span-2",
  },
] as const

export const LANDING_STEP_IMAGES = [
  {
    imageId: LANDING_PRODUCTS[6].imageId,
    alt: "Polarized Sunglasses product photo",
  },
  {
    imageId: LANDING_PRODUCTS[1].imageId,
    alt: "Wireless Headphones product photo",
  },
  {
    imageId: LANDING_PRODUCTS[5].imageId,
    alt: "Bluetooth Speaker product photo",
  },
] as const

export const LANDING_HIGHLIGHT_COLLAGE = [
  {
    imageId: LANDING_PRODUCTS[0].imageId,
    alt: LANDING_PRODUCTS[0].name,
    className: "left-0 top-0 z-10 w-[72%]",
  },
  {
    imageId: LANDING_PRODUCTS[11].imageId,
    alt: LANDING_PRODUCTS[11].name,
    className: "right-0 top-8 z-20 w-[48%]",
  },
  {
    imageId: LANDING_PRODUCTS[3].imageId,
    alt: LANDING_PRODUCTS[3].name,
    className: "bottom-0 left-[18%] z-30 w-[55%]",
  },
] as const

export const LANDING_HERO_FLOATERS = [
  {
    imageId: LANDING_PRODUCTS[4].imageId,
    alt: LANDING_PRODUCTS[4].name,
    className: "right-6 -top-3 hidden size-20 rotate-[-8deg] sm:block lg:size-24",
  },
  {
    imageId: LANDING_PRODUCTS[8].imageId,
    alt: LANDING_PRODUCTS[8].name,
    className: "-right-3 bottom-12 hidden size-16 rotate-[12deg] sm:block lg:bottom-16 lg:size-20",
  },
] as const

export const LANDING_STORE_LOGO_IMAGE_ID = LANDING_PRODUCTS[4].imageId
