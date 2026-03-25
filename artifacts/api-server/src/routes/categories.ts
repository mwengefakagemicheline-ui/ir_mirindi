import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const categories = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      description: categoriesTable.description,
      productCount: count(productsTable.id),
    })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id);

  res.json(
    categories.map((category) => ({
      ...category,
      productCount:
        category.productCount === null || category.productCount === undefined
          ? undefined
          : Number(category.productCount),
    })),
  );
});

export default router;
