/** Stable picsum URLs for landing page visuals (no DB dependency). */
export function landingImage(seed: string, width: number, height = width) {
  return `https://picsum.photos/seed/uwa-${seed}/${width}/${height}`
}

export const LANDING_PREVIEW_PRODUCTS = [
  { name: "Leather tote", price: "$129", seed: "leather-tote" },
  { name: "Studio headphones", price: "$249", seed: "headphones" },
  { name: "Runner sneakers", price: "$98", seed: "sneakers" },
  { name: "Pour-over set", price: "$54", seed: "coffee-set" },
  { name: "Ceramic mug pair", price: "$26", seed: "ceramic-mug" },
  { name: "Bluetooth speaker", price: "$79", seed: "speaker" },
] as const

export const LANDING_GALLERY_IMAGES = [
  { seed: "gallery-1", alt: "Handmade leather goods on display", className: "md:col-span-2 md:row-span-2" },
  { seed: "gallery-2", alt: "Fresh coffee and pastries", className: "md:col-span-1" },
  { seed: "gallery-3", alt: "Minimal home decor shelf", className: "md:col-span-1" },
  { seed: "gallery-4", alt: "Boutique clothing rack", className: "md:col-span-1" },
  { seed: "gallery-5", alt: "Skincare products flat lay", className: "md:col-span-1" },
  { seed: "gallery-6", alt: "Artisan jewelry collection", className: "md:col-span-2" },
] as const

export const LANDING_STEP_IMAGES = [
  { seed: "step-store", alt: "Store branding setup" },
  { seed: "step-products", alt: "Product catalog grid" },
  { seed: "step-share", alt: "Sharing catalog on mobile" },
] as const

export const LANDING_HIGHLIGHT_COLLAGE = [
  { seed: "collage-main", alt: "Storefront product grid", className: "left-0 top-0 z-10 w-[72%]" },
  { seed: "collage-phone", alt: "Mobile catalog view", className: "right-0 top-8 z-20 w-[48%]" },
  { seed: "collage-detail", alt: "Product detail page", className: "bottom-0 left-[18%] z-30 w-[55%]" },
] as const

export const LANDING_HERO_FLOATERS = [
  { seed: "float-a", alt: "", className: "right-6 -top-3 hidden size-20 rotate-[-8deg] sm:block lg:size-24" },
  { seed: "float-b", alt: "", className: "-right-3 bottom-12 hidden size-16 rotate-[12deg] sm:block lg:bottom-16 lg:size-20" },
] as const
