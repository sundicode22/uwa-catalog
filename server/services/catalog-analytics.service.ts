import { eq } from "drizzle-orm"
import { catalogPageViews, db, stores } from "@/lib/db"

const BOT_PATTERN =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|preview/i

export const catalogAnalyticsService = {
  isBot(userAgent?: string | null) {
    if (!userAgent) return false
    return BOT_PATTERN.test(userAgent)
  },

  async recordPageView(input: {
    storeSlug: string
    path: string
    visitorId: string
    referrer?: string | null
    userAgent?: string | null
  }) {
    if (!input.visitorId?.trim()) return { recorded: false as const }
    if (this.isBot(input.userAgent)) return { recorded: false as const }

    const [store] = await db
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.slug, input.storeSlug))

    if (!store) return { recorded: false as const }

    await db.insert(catalogPageViews).values({
      storeId: store.id,
      path: input.path.slice(0, 500),
      visitorId: input.visitorId.slice(0, 128),
      referrer: input.referrer?.slice(0, 500) ?? null,
      userAgent: input.userAgent?.slice(0, 500) ?? null,
    })

    return { recorded: true as const }
  },
}
