import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db/schema";
import { eq, like, gte, lte, and, count } from "drizzle-orm";
import {
  ListProductsQueryParams,
  CreateProductBody,
  GetProductParams,
  UpdateProductBody,
  UpdateProductParams,
  DeleteProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const toIsoString = (value: Date | string | null | undefined) => {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
};

const normalizeProduct = <
  T extends {
    price: unknown;
    promoPrice?: unknown | null;
    createdAt?: Date | string | null;
  },
>(
  product: T,
) => ({
  ...product,
  price: Number(product.price),
  promoPrice:
    product.promoPrice === null || product.promoPrice === undefined
      ? undefined
      : Number(product.promoPrice),
  createdAt: toIsoString(product.createdAt),
});

router.get("/", async (req, res) => {
  const query = ListProductsQueryParams.parse(req.query);
  const { category, search, minPrice, maxPrice, page = 1, limit = 12 } = query;

  const filters = [];
  if (category) filters.push(eq(categoriesTable.slug, category));
  if (search) filters.push(like(productsTable.name, `%${search}%`));
  if (minPrice !== undefined) filters.push(gte(productsTable.price, String(minPrice)));
  if (maxPrice !== undefined) filters.push(lte(productsTable.price, String(maxPrice)));

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const [rawProducts, [{ total: rawTotal }]] = await Promise.all([
    db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        imageUrl: productsTable.imageUrl,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        stock: productsTable.stock,
        isNew: productsTable.isNew,
        isPromo: productsTable.isPromo,
        promoPrice: productsTable.promoPrice,
        brand: productsTable.brand,
        sku: productsTable.sku,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(whereClause)
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ total: count() })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(whereClause),
  ]);

  const products = rawProducts.map(normalizeProduct);
  const total = Number(rawTotal);
  const totalPages = Math.ceil(total / limit);
  res.json({ products, total, page, limit, totalPages });
});

router.post("/", async (req, res) => {
  const body = CreateProductBody.parse(req.body);
  const [product] = await db
    .insert(productsTable)
    .values({
      ...body,
      price: String(body.price),
      promoPrice:
        body.promoPrice === undefined || body.promoPrice === null
          ? null
          : String(body.promoPrice),
    })
    .returning();
  res.status(201).json(normalizeProduct(product));
});

router.get("/:id", async (req, res) => {
  const { id } = GetProductParams.parse(req.params);
  const [product] = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      price: productsTable.price,
      imageUrl: productsTable.imageUrl,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      stock: productsTable.stock,
      isNew: productsTable.isNew,
      isPromo: productsTable.isPromo,
      promoPrice: productsTable.promoPrice,
      brand: productsTable.brand,
      sku: productsTable.sku,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id));

  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(normalizeProduct(product));
});

router.put("/:id", async (req, res) => {
  const { id } = UpdateProductParams.parse(req.params);
  const body = UpdateProductBody.parse(req.body);
  const [product] = await db
    .update(productsTable)
    .set({
      ...body,
      price: String(body.price),
      promoPrice:
        body.promoPrice === undefined || body.promoPrice === null
          ? null
          : String(body.promoPrice),
    })
    .where(eq(productsTable.id, id))
    .returning();
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(normalizeProduct(product));
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteProductParams.parse(req.params);
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.status(204).send();
});

export default router;
