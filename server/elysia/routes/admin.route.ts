import { Elysia, t } from "elysia"
import { authPlugin, requireAuth } from "../plugins/auth"
import { adminController } from "../controllers/admin.controller"

const paginationQuery = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  search: t.Optional(t.String()),
})

const withdrawalQuery = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  status: t.Optional(t.String()),
  search: t.Optional(t.String()),
})

const withdrawalActionBody = t.Object({
  action: t.Union([
    t.Literal("approve"),
    t.Literal("reject"),
    t.Literal("mark_paid"),
  ]),
  note: t.Optional(t.String()),
})

const settingsBody = t.Object({
  platformFeePercent: t.Optional(t.Number()),
  minWithdrawalAmount: t.Optional(t.Number()),
})

export const adminRoutes = new Elysia()
  .use(authPlugin)
  .get("/admin/overview", ({ session }) =>
    adminController.getOverview(session?.user?.email)
  )
  .get(
    "/admin/withdrawals",
    ({ session, query }) =>
      adminController.listWithdrawals(session?.user?.email, {
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        status: query.status as
          | "pending"
          | "approved"
          | "rejected"
          | "processing"
          | "paid"
          | "failed"
          | undefined,
        search: query.search,
      }),
    { query: withdrawalQuery }
  )
  .patch(
    "/admin/withdrawals/:id",
    ({ session, userId, params, body }) =>
      adminController.updateWithdrawal(
        session?.user?.email,
        requireAuth(userId),
        params.id,
        body.action,
        body.note
      ),
    {
      params: t.Object({ id: t.String() }),
      body: withdrawalActionBody,
    }
  )
  .get(
    "/admin/users",
    ({ session, query }) =>
      adminController.listUsers(session?.user?.email, {
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        search: query.search,
      }),
    { query: paginationQuery }
  )
  .get(
    "/admin/stores",
    ({ session, query }) =>
      adminController.listStores(session?.user?.email, {
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        search: query.search,
      }),
    { query: paginationQuery }
  )
  .get(
    "/admin/visitors",
    ({ session, query }) =>
      adminController.getVisitors(session?.user?.email, {
        storeId: query.storeId,
        days: query.days ? Number(query.days) : undefined,
      }),
    {
      query: t.Object({
        storeId: t.Optional(t.String()),
        days: t.Optional(t.String()),
      }),
    }
  )
  .get("/admin/settings", ({ session }) =>
    adminController.getSettings(session?.user?.email)
  )
  .patch(
    "/admin/settings",
    ({ session, body }) =>
      adminController.updateSettings(session?.user?.email, body),
    { body: settingsBody }
  )
