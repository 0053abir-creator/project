import { getCollection, ObjectId } from "@/lib/mongodb";
import { getSession, requireAuth } from "@/lib/auth";
import {
  jsonSuccess,
  jsonError,
  validateItemInput,
  toObjectId,
  maskSensitiveDetails,
  STATUS_CONFIG,
} from "@/lib/helpers";
import config from "@/lib/config";

export const dynamic = "force-dynamic";

// GET /api/items - Everyone - List and filter items
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const location = searchParams.get("location") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const reportedBy = searchParams.get("reportedBy") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(
      1,
      parseInt(searchParams.get("limit") || config.itemsPerPage.toString(), 10)
    );

    // Current session to determine permissions and sensitive masking
    const sessionData = await getSession(request);
    const currentUserId = sessionData?.user?.id;
    const currentUserRole = sessionData?.user?.role;

    const itemsCol = await getCollection("items");
    const categoriesCol = await getCollection("categories");
    const usersCol = await getCollection("users");

    // Build query
    const query = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (category && category !== "all") {
      query.categoryId = category;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (location && location !== "all") {
      query.location = { $regex: location, $options: "i" };
    }

    if (reportedBy) {
      query.reportedBy = reportedBy;
    }

    if (from || to) {
      query.dateOccurred = {};
      if (from) query.dateOccurred.$gte = from;
      if (to) query.dateOccurred.$lte = to;
    }

    if (search.trim()) {
      query.$text = { $search: search.trim() };
    }

    const total = await itemsCol.countDocuments(query);
    const skip = (page - 1) * limit;

    const rawItems = await itemsCol
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Populate category & reporter details
    const allCategories = await categoriesCol.find({}).toArray();
    const catMap = {};
    allCategories.forEach((cat) => {
      catMap[cat._id.toString()] = cat.name;
    });

    const populatedItems = await Promise.all(
      rawItems.map(async (item) => {
        const catName = catMap[item.categoryId?.toString()] || "General";
        let reporterName = "Campus Member";
        let reporterDept = "";

        if (item.reportedBy) {
          const reporter = await usersCol.findOne({ _id: toObjectId(item.reportedBy) });
          if (reporter) {
            reporterName = reporter.name;
            reporterDept = reporter.department || "";
          }
        }

        const sanitized = maskSensitiveDetails(item, currentUserId, currentUserRole);

        return {
          id: item._id.toString(),
          _id: item._id.toString(),
          type: sanitized.type,
          title: sanitized.title,
          description: sanitized.description,
          categoryId: sanitized.categoryId?.toString(),
          categoryName: catName,
          location: sanitized.location,
          dateOccurred: sanitized.dateOccurred,
          status: sanitized.status,
          statusMeta: STATUS_CONFIG[sanitized.status] || STATUS_CONFIG.open,
          reportedBy: sanitized.reportedBy?.toString(),
          reporterName,
          reporterDept,
          contactPreference: sanitized.contactPreference || "Not specified",
          createdAt: sanitized.createdAt,
          updatedAt: sanitized.updatedAt,
          isOwner: currentUserId && sanitized.reportedBy?.toString() === currentUserId.toString(),
        };
      })
    );

    return jsonSuccess({
      items: populatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("GET /api/items error:", err);
    return jsonError("Failed to fetch items", 500);
  }
}

// POST /api/items - Student - Create report
export async function POST(request) {
  try {
    const authRes = await requireAuth(request);
    if (authRes.error) {
      return jsonError(authRes.error, authRes.status);
    }

    const body = await request.json();
    const validation = validateItemInput(body);

    if (!validation.isValid) {
      return jsonError("Validation failed", 400, validation.errors);
    }

    const { type, title, description, categoryId, location, dateOccurred, contactPreference } =
      body;

    const itemsCol = await getCollection("items");
    const categoriesCol = await getCollection("categories");
    const newItemId = new ObjectId();

    let resolvedCategoryId = categoryId ? categoryId.toString() : null;
    if (!resolvedCategoryId) {
      const defaultCat = await categoriesCol.findOne({});
      if (defaultCat) resolvedCategoryId = defaultCat._id.toString();
    }

    const newItem = {
      _id: newItemId,
      type,
      title: title.trim(),
      description: description.trim(),
      categoryId: resolvedCategoryId,
      location: location.trim(),
      dateOccurred,
      status: "open", // Initial status
      reportedBy: authRes.user.id,
      contactPreference: contactPreference ? contactPreference.trim() : "Via Lost & Found Desk",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await itemsCol.insertOne(newItem);

    return jsonSuccess(
      {
        message: "Item reported successfully",
        item: {
          ...newItem,
          id: newItemId.toString(),
          _id: newItemId.toString(),
        },
      },
      201
    );
  } catch (err) {
    console.error("POST /api/items error:", err);
    return jsonError("Failed to create item report", 500);
  }
}
