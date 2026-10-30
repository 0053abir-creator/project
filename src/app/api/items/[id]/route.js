import { getCollection } from "@/lib/mongodb";
import { getSession, requireAuth } from "@/lib/auth";
import {
  jsonSuccess,
  jsonError,
  toObjectId,
  maskSensitiveDetails,
  validateItemInput,
  STATUS_CONFIG,
} from "@/lib/helpers";

export const dynamic = "force-dynamic";

// GET /api/items/[id] - Everyone
export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!id) return jsonError("Item ID is required", 400);

    const itemsCol = await getCollection("items");
    const categoriesCol = await getCollection("categories");
    const usersCol = await getCollection("users");
    const claimsCol = await getCollection("claims");

    let item = await itemsCol.findOne({ _id: toObjectId(id) });
    if (!item) {
      item = await itemsCol.findOne({ _id: id });
    }

    if (!item) {
      return jsonError("Item not found", 404);
    }

    const sessionData = await getSession(request);
    const currentUserId = sessionData?.user?.id;
    const currentUserRole = sessionData?.user?.role;

    // Category name
    let categoryName = "General";
    if (item.categoryId) {
      const cat = await categoriesCol.findOne({ _id: toObjectId(item.categoryId) });
      if (cat) categoryName = cat.name;
    }

    // Reporter name & department
    let reporterName = "Campus Member";
    let reporterDept = "";
    if (item.reportedBy) {
      const reporter = await usersCol.findOne({ _id: toObjectId(item.reportedBy) });
      if (reporter) {
        reporterName = reporter.name;
        reporterDept = reporter.department || "";
      }
    }

    const isOwner =
      Boolean(currentUserId && item.reportedBy && item.reportedBy.toString() === currentUserId.toString());
    const isAdmin = currentUserRole === "admin";

    // Check user's claim on this item (if any)
    let userClaim = null;
    let activeClaim = null;

    if (currentUserId) {
      const claim = await claimsCol.findOne({
        itemId: item._id.toString(),
        claimedBy: currentUserId.toString(),
      });
      if (claim) {
        userClaim = {
          id: claim._id.toString(),
          status: claim.status,
          proofDescription: claim.proofDescription,
          reviewNote: claim.reviewNote,
          createdAt: claim.createdAt,
        };
      }
    }

    // Admin can see the active claim if item is claim_pending
    if (isAdmin && item.status === "claim_pending") {
      const claim = await claimsCol.findOne({
        itemId: item._id.toString(),
        status: { $in: ["pending", "approved"] },
      });
      if (claim) {
        let claimantName = "Student";
        const claimant = await usersCol.findOne({ _id: toObjectId(claim.claimedBy) });
        if (claimant) claimantName = claimant.name;
        activeClaim = {
          id: claim._id.toString(),
          claimedBy: claim.claimedBy,
          claimantName,
          proofDescription: claim.proofDescription,
          status: claim.status,
          createdAt: claim.createdAt,
        };
      }
    }

    const sanitized = maskSensitiveDetails(item, currentUserId, currentUserRole);

    return jsonSuccess({
      item: {
        id: sanitized._id.toString(),
        _id: sanitized._id.toString(),
        type: sanitized.type,
        title: sanitized.title,
        description: sanitized.description,
        categoryId: sanitized.categoryId?.toString(),
        categoryName,
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
        isOwner,
        isAdmin,
        canClaim:
          !isOwner &&
          item.status === "open" &&
          item.type === "found" &&
          (!userClaim || userClaim.status === "rejected"),
        userClaim,
        activeClaim,
      },
    });
  } catch (err) {
    console.error("GET /api/items/[id] error:", err);
    return jsonError("Failed to fetch item details", 500);
  }
}

// PUT /api/items/[id] - Owner, admin
export async function PUT(request, { params }) {
  try {
    const authRes = await requireAuth(request);
    if (authRes.error) {
      return jsonError(authRes.error, authRes.status);
    }

    const { id } = params;
    const itemsCol = await getCollection("items");

    let item = await itemsCol.findOne({ _id: toObjectId(id) });
    if (!item) item = await itemsCol.findOne({ _id: id });

    if (!item) {
      return jsonError("Item not found", 404);
    }

    const isOwner = item.reportedBy && item.reportedBy.toString() === authRes.user.id.toString();
    const isAdmin = authRes.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return jsonError("You are not authorized to edit this item report.", 403);
    }

    // Owner can only edit while item is 'open'
    if (isOwner && !isAdmin && item.status !== "open") {
      return jsonError("You can only edit an item report while its status is 'open'.", 400);
    }

    const body = await request.json();
    const validation = validateItemInput({
      type: body.type || item.type,
      title: body.title || item.title,
      description: body.description || item.description,
      categoryId: body.categoryId || item.categoryId,
      location: body.location || item.location,
      dateOccurred: body.dateOccurred || item.dateOccurred,
    });

    if (!validation.isValid) {
      return jsonError("Validation failed", 400, validation.errors);
    }

    const updateFields = {
      type: body.type || item.type,
      title: body.title.trim(),
      description: body.description.trim(),
      categoryId: (body.categoryId !== undefined ? body.categoryId : item.categoryId)?.toString() || null,
      location: body.location.trim(),
      dateOccurred: body.dateOccurred,
      contactPreference: body.contactPreference ? body.contactPreference.trim() : item.contactPreference,
      updatedAt: new Date(),
    };

    // Admin can also update status (e.g. close invalid/expired report)
    if (isAdmin && body.status) {
      updateFields.status = body.status;
    }

    await itemsCol.updateOne({ _id: item._id }, { $set: updateFields });

    return jsonSuccess({
      message: "Item updated successfully",
      item: { ...item, ...updateFields, id: item._id.toString() },
    });
  } catch (err) {
    console.error("PUT /api/items/[id] error:", err);
    return jsonError("Failed to update item", 500);
  }
}

// DELETE /api/items/[id] - Owner, admin
export async function DELETE(request, { params }) {
  try {
    const authRes = await requireAuth(request);
    if (authRes.error) {
      return jsonError(authRes.error, authRes.status);
    }

    const { id } = params;
    const itemsCol = await getCollection("items");
    const claimsCol = await getCollection("claims");

    let item = await itemsCol.findOne({ _id: toObjectId(id) });
    if (!item) item = await itemsCol.findOne({ _id: id });

    if (!item) {
      return jsonError("Item not found", 404);
    }

    const isOwner = item.reportedBy && item.reportedBy.toString() === authRes.user.id.toString();
    const isAdmin = authRes.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return jsonError("You are not authorized to delete this item report.", 403);
    }

    // Owner can only delete while status is 'open'
    if (isOwner && !isAdmin && item.status !== "open") {
      return jsonError("You can only delete an item report while its status is 'open'.", 400);
    }

    // Delete item
    await itemsCol.deleteOne({ _id: item._id });
    // Cleanup any claims on this item
    await claimsCol.deleteOne({ itemId: item._id.toString() });

    return jsonSuccess({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/items/[id] error:", err);
    return jsonError("Failed to delete item", 500);
  }
}
