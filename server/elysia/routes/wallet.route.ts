import { Elysia, t } from "elysia"
import { authPlugin, requireAuth } from "../plugins/auth"
import { walletController } from "../controllers/wallet.controller"

const withdrawalBody = t.Object({
  amount: t.String(),
  currency: t.String(),
  payoutMethod: t.String(),
  payoutDetails: t.Object({
    accountName: t.Optional(t.String()),
    phone: t.Optional(t.String()),
    operator: t.Optional(t.String()),
    notes: t.Optional(t.String()),
  }),
})

export const walletRoutes = new Elysia()
  .use(authPlugin)
  .get("/wallet", ({ userId }) =>
    walletController.getSummary(requireAuth(userId))
  )
  .get(
    "/wallet/ledger",
    ({ userId, query }) =>
      walletController.listLedger(requireAuth(userId), {
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        currency: query.currency,
      }),
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        currency: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/wallet/withdrawals",
    ({ userId, body }) =>
      walletController.createWithdrawal(requireAuth(userId), body),
    { body: withdrawalBody }
  )
  .get(
    "/wallet/withdrawals",
    ({ userId, query }) =>
      walletController.listWithdrawals(requireAuth(userId), {
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
      }),
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    }
  )
