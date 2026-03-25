import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable } from "@workspace/db/schema";
import { eq, inArray } from "drizzle-orm";
import { CreateOrderBody, GetOrderParams } from "@workspace/api-zod";

const router: IRouter = Router();

const toIsoString = (value: Date | string | null | undefined) => {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
};

router.post("/", async (req, res) => {
  const body = CreateOrderBody.parse(req.body);

  if (body.items.length === 0) {
    return res.status(400).json({ error: "Order must contain at least one item" });
  }

  const uniqueProductIds = [...new Set(body.items.map((i) => i.productId))];
  const products = await db
    .select()
    .from(productsTable)
    .where(inArray(productsTable.id, uniqueProductIds));
  const productMap = new Map(products.map((p) => [p.id, p]));

  if (products.length !== uniqueProductIds.length) {
    const missing = uniqueProductIds.filter((id) => !productMap.has(id));
    return res.status(400).json({ error: "Products not found", missing });
  }

  let total = 0;
  const itemsWithDetails = body.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    const unitPrice = Number(product.price);
    const itemTotal = unitPrice * item.quantity;
    total += itemTotal;
    return {
      productId: item.productId,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: String(unitPrice),
      totalPrice: String(itemTotal),
    };
  });

  const [order] = await db
    .insert(ordersTable)
    .values({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      shippingAddress: body.shippingAddress,
      city: body.city,
      postalCode: body.postalCode,
      total: String(total),
      status: "pending",
    })
    .returning();

  await db.insert(orderItemsTable).values(
    itemsWithDetails.map((item) => ({ ...item, orderId: order.id }))
  );

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  res.status(201).json({
    ...order,
    total: Number(order.total),
    createdAt: toIsoString(order.createdAt),
    items: items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
  });
});

router.get("/", async (_req, res) => {
  const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  const result = await Promise.all(
    orders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, order.id));
      return {
        ...order,
        total: Number(order.total),
        createdAt: toIsoString(order.createdAt),
        items: items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
      };
    })
  );
  res.json(result);
});

router.get("/:id", async (req, res) => {
  const { id } = GetOrderParams.parse(req.params);
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id));

  if (!order) return res.status(404).json({ error: "Order not found" });

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, id));

  res.json({
    ...order,
    total: Number(order.total),
    createdAt: toIsoString(order.createdAt),
    items: items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
  });
});

export default router;
