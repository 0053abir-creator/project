import { getCollection, ObjectId } from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/helpers";

export const dynamic = "force-dynamic";

// GET /api/categories - Everyone
export async function GET() {
  try {
    const categoriesCol = await getCollection("categories");
    const categories = await categoriesCol.find({}).sort({ name: 1 }).toArray();

    return jsonSuccess({
      categories: categories.map((cat) => ({
        id: cat._id.toString(),
        _id: cat._id.toString(),
        name: cat.name,
        createdAt: cat.createdAt,
      })),
    });
  } catch (err) {
    console.error("GET /api/categories error:", err);
    return jsonError("Failed to fetch categories", 500);
  }
}

// POST /api/categories - Admin
export async function POST(request) {
  try {
    const authRes = await requireRole(request, "admin");
    if (authRes.error) {
      return jsonError(authRes.error, authRes.status);
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return jsonError("Category name must be at least 2 characters.", 400);
    }

    const categoriesCol = await getCollection("categories");
    const existing = await categoriesCol.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });

    if (existing) {
      return jsonError("This category already exists.", 409);
    }

    const newCategory = {
      _id: new ObjectId(),
      name: name.trim(),
      createdAt: new Date(),
    };

    await categoriesCol.insertOne(newCategory);

    return jsonSuccess(
      {
        message: "Category created successfully",
        category: {
          id: newCategory._id.toString(),
          _id: newCategory._id.toString(),
          name: newCategory.name,
          createdAt: newCategory.createdAt,
        },
      },
      201
    );
  } catch (err) {
    console.error("POST /api/categories error:", err);
    return jsonError("Failed to create category", 500);
  }
}
