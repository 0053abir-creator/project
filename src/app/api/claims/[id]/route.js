import { getCollection } from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import { jsonSuccess, jsonError, toObjectId } from "@/lib/helpers";

export const dynamic = "force-dynamic";

// PUT /api/claims/[id] - Admin
export async function PUT(request, { params }) {
  try {
    const authRes = await requireRole(request, "admin");
    if (authRes.error) {
      return jsonError(authRes.error, authRes.status);
    }

    const { id } = params;
    const body = await request.json();
    const { status, reviewNote } = body;

    if (!["approved", "rejected"].includes(status)) {
      return jsonError("Status must be either 'approved' or 'rejected'.", 400);
    }

    const claimsCol = await getCollection("claims");
    const itemsCol = await getCollection("items");

    let claim = await claimsCol.findOne({ _id: toObjectId(id) });
    if (!claim) claim = await claimsCol.findOne({ _id: id });

    if (!claim) {
      return jsonError("Claim not found", 404);
    }

    if (claim.status !== "pending") {
      return jsonError(`Claim has already been reviewed (${claim.status}).`, 400);
    }

    const now = new Date();
    await claimsCol.updateOne(
      { _id: claim._id },
      {
        $set: {
          status,
          reviewNote: reviewNote ? reviewNote.trim() : null,
          reviewedBy: authRes.user.id,
          reviewedAt: now,
        },
      }
    );

    // PRD 6.3: If rejected, item status reverts to 'open'
    if (status === "rejected") {
      let item = await itemsCol.findOne({ _id: toObjectId(claim.itemId) });
      if (!item) item = await itemsCol.findOne({ _id: claim.itemId });
      if (item) {
        await itemsCol.updateOne(
          { _id: item._id },
          { $set: { status: "open", updatedAt: now } }
        );
      }
    }

    return jsonSuccess({
      message: `Claim successfully ${status}.`,
      claim: {
        id: claim._id.toString(),
        status,
        reviewNote: reviewNote ? reviewNote.trim() : null,
        reviewedBy: authRes.user.id,
        reviewedAt: now,
      },
    });
  } catch (err) {
    console.error("PUT /api/claims/[id] error:", err);
    return jsonError("Failed to review claim", 500);
  }
}
