import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiters.js";
import { validateBody, validateObjectId, validateQuery } from "../middleware/validate.js";
import * as schemas from "../validators/schemas.js";
import * as users from "../controllers/userController.js";
import * as tables from "../controllers/tableController.js";
import * as orders from "../controllers/orderController.js";
import * as payments from "../controllers/paymentController.js";
import * as menu from "../controllers/menuController.js";
import { getRevenueReport, getStats } from "../controllers/statsController.js";
import { STAFF_ROLES } from "../models/User.js";

const router = Router();
const adminOnly = requireRole("Admin");
// Client ma y9derch ychouf tables, commandes dyal nas w stats
const staffOnly = requireRole(...STAFF_ROLES);

// Auth (public)
router.post("/user/register", authLimiter, validateBody(schemas.registerSchema), users.register);
router.post("/user/login", authLimiter, validateBody(schemas.loginSchema), users.login);
router.post("/user/logout", users.logout);

// Kolchi men hna l-te7t khasso session
router.use(requireAuth);

router.get("/user", users.getMe);
router.get("/user/all", adminOnly, users.listUsers);
router.put(
  "/user/:id/role",
  adminOnly,
  validateObjectId(),
  validateBody(schemas.roleSchema),
  users.updateRole
);

router.get("/table", staffOnly, tables.listTables);
router.get("/table/:id/history", staffOnly, validateObjectId(), tables.getTableHistory);
router.post("/table", adminOnly, validateBody(schemas.createTableSchema), tables.createTable);
router.put(
  "/table/:id",
  staffOnly,
  validateObjectId(),
  validateBody(schemas.updateTableSchema),
  tables.updateTable
);

router.get("/menu", menu.listMenu);
router.post("/menu", adminOnly, validateBody(schemas.createMenuItemSchema), menu.createMenuItem);
router.put(
  "/menu/:id",
  adminOnly,
  validateObjectId(),
  validateBody(schemas.updateMenuItemSchema),
  menu.updateMenuItem
);

router.get("/order", staffOnly, orders.listOrders);
router.get("/order/mine", orders.listMyOrders);
router.post("/order", validateBody(schemas.createOrderSchema), orders.createOrder);
router.put(
  "/order/:id",
  staffOnly,
  validateObjectId(),
  validateBody(schemas.updateOrderStatusSchema),
  orders.updateOrderStatus
);

router.get("/stats", staffOnly, getStats);
router.get(
  "/stats/revenue",
  adminOnly,
  validateQuery(schemas.revenueQuerySchema),
  getRevenueReport
);

router.get("/payment/config", payments.getPaymentConfig);
router.post(
  "/payment/create-order",
  validateBody(schemas.createPaymentSchema),
  payments.createPaymentOrder
);
router.post(
  "/payment/verify-payment",
  validateBody(schemas.verifyPaymentSchema),
  payments.verifyPayment
);

export default router;
