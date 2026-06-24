export const LANDING_NAV = {
  features: [
    {
      title: "Storefronts",
      href: "#features",
      description: "Shareable catalog pages with your branding.",
    },
    {
      title: "Inventory",
      href: "#features",
      description: "Track stock and show what's left at checkout.",
    },
    {
      title: "Product options",
      href: "#features",
      description: "Sizes, variations, and modifiers with images.",
    },
    {
      title: "WhatsApp orders",
      href: "#features",
      description: "Route orders to WhatsApp or manage in-app.",
    },
  ],
  product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
} as const

export const TESTIMONIALS = [
  {
    name: "Amara Osei",
    role: "Boutique owner",
    quote:
      "We replaced our PDF catalog in a weekend. Customers order faster and we finally track stock properly.",
  },
  {
    name: "James Chen",
    role: "Home goods seller",
    quote:
      "WhatsApp checkout is a game changer for our market. Orders land organized in the dashboard.",
  },
  {
    name: "Sofia Martinez",
    role: "Food pop-up",
    quote:
      "Modifiers with images made our menu crystal clear. Setup was simple and the storefront looks premium.",
  },
  {
    name: "David Okon",
    role: "Electronics reseller",
    quote:
      "Inventory limits stopped overselling during busy weeks. The team loves the clean admin experience.",
  },
  {
    name: "Lena Park",
    role: "Artisan crafts",
    quote:
      "Beautiful layouts without hiring a developer. Our catalog link is now on every social bio.",
  },
] as const

export const FAQ_ITEMS = [
  {
    question: "Do customers need an account to order?",
    answer:
      "No. Shoppers browse your public catalog and check out with their name and phone number.",
  },
  {
    question: "Can I use WhatsApp for orders?",
    answer:
      "Yes. Enable WhatsApp mode in store settings and orders open in WhatsApp while still saving to your dashboard.",
  },
  {
    question: "How does inventory work?",
    answer:
      "Turn on stock tracking per product. The storefront, cart, and checkout respect available quantity.",
  },
  {
    question: "Can I customize my catalog layout?",
    answer:
      "Choose catalog layouts and feature products in the hero. Premium tiers unlock more storefront options.",
  },
] as const
