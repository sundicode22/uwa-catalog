import {
  BarChart3Icon,
  LayersIcon,
  MessageCircleIcon,
  PackageIcon,
  PaletteIcon,
  ShoppingBagIcon,
} from "lucide-react"
import { getSiteName } from "@/lib/seo/site"

const FEATURES = [
  {
    icon: ShoppingBagIcon,
    title: "Shareable storefronts",
    description:
      "Publish a catalog at a clean URL. Customers browse products without creating an account.",
  },
  {
    icon: PaletteIcon,
    title: "Layouts that fit your brand",
    description:
      "Switch between catalog styles, feature hero products, and customize your store profile.",
  },
  {
    icon: LayersIcon,
    title: "Sizes, variations & modifiers",
    description:
      "Let customers pick options with images, price adjustments, and clear selection rules.",
  },
  {
    icon: PackageIcon,
    title: "Inventory tracking",
    description:
      "Track stock per product, show what’s left in the cart, and prevent overselling at checkout.",
  },
  {
    icon: MessageCircleIcon,
    title: "WhatsApp-ready orders",
    description:
      "Send orders straight to WhatsApp or manage them in your dashboard — your choice.",
  },
  {
    icon: BarChart3Icon,
    title: "Orders & insights",
    description:
      "Review orders, update status, and monitor revenue trends from one place.",
  },
]

export function LandingFeatures() {
  const siteName = getSiteName()

  return (
    <section id="features" className="border-b border-border py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
          <p className="text-sm font-medium text-primary">Features</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to sell from a link
          </h2>
          <p className="mt-4 text-muted-foreground">
            From product setup to checkout, {siteName} keeps the workflow simple
            for small teams and solo sellers.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-fade-in-up rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-md"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <h3 className="font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
