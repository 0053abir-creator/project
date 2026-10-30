import { getCollection, ObjectId } from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import { jsonSuccess, jsonError, validateReturnInput, toObjectId } from "@/lib/helpers";

export const dynamic = "force-dynamic";

// GET /api/returns - Admin - List returns audit log
export async function GET(request) {
  try {
    const authRes = await requireRole(request, "admin");
    if (authRes.error) {
      return jsonError(authRes.error, authRes.status);
    }

    const returnsCol = await getCollection("returns");
    const itemsCol = await getCollection("items");
    const usersCol = await getCollection("users");

    const returns = await returnsCol.find({}).sort({ returnedAt: -1 }).toArray();

    const populatedReturns = await Promise.all(
      returns.map(async (ret) => {
        let itemTitle = "Item";
        let itemLocation = "";
        if (ret.itemId) {
          const item = await itemsCol.findOne({ _id: toObjectId(ret.itemId) });
          if (item) {
            itemTitle = item.title;
            itemLocation = item.location;
          }
        }

        let handedOverByName = "Desk Officer";
        if (ret.handedOverBy) {
          const officer = await usersCol.findOne({ _id: toObjectId(ret.handedOverBy) });
          if (officer) handedOverByName = officer.name;
        }

        return {
          id: ret._id.toString(),
          _id: ret._id.toString(),
          itemId: ret.itemId,
          itemTitle,
          itemLocation,
          claimId: ret.claimId,
          receivedBy: ret.receivedBy,
          handedOverBy: ret.handedOverBy,
          handedOverByName,
          notes: ret.notes || "",
          returnedAt: ret.returnedAt,
        };
      })
    );

    return jsonSuccess({ returns: populatedReturns });
  } catch (err) {
    console.error("GET /api/returns error:", err);
    return jsonError("Failed to fetch returns log", 500);
  }
}

// POST /api/returns - Admin - Record handover
export async function POST(request) {
  try {
    const authRes = await requireRole(request, "admin");
    if (authRes.error) {
      return jsonError(authRes.error, authRes.status);
    }

    const body = await request.json();
    const validation = validateReturnInput(body);

    if (!validation.isValid) {
      return jsonError("Validation failed", 400, validation.errors);
    }

    const { itemId, claimId, receivedBy, notes } = body;
    const itemsCol = await getCollection("items");
    const claimsCol = await getCollection("claims");
    const returnsCol = await getCollection("returns");

    let item = await itemsCol.findOne({ _id: toObjectId(itemId) });
    if (!item) item = await itemsCol.findOne({ _id: itemId });

    if (!item) {
      return jsonError("Item not found", 404);
    }

    let claim = await claimsCol.findOne({ _id: toObjectId(claimId) });
    if (!claim) claim = await claimsCol.findOne({ _id: claimId });

    if (!claim) {
      return jsonError("Claim not found", 404);
    }

    if (claim.status !== "approved") {
      return jsonError("Cannot record handover for a claim that is not approved.", 400);
    }

    const now = new Date();
    const newReturnId = new ObjectId();

    const returnDoc = {
      _id: newReturnId,
      itemId: item._id.toString(),
      claimId: claim._id.toString(),
      receivedBy: receivedBy.trim(),
      handedOverBy: authRes.user.id,
      notes: notes ? notes.trim() : "",
      returnedAt: now,
    };

    await returnsCol.insertOne(returnDoc);

    // PRD 6.4: Item becomes 'returned' and cannot be claimed again
    await itemsCol.updateOne(
      { _id: item._id },
      { $set: { status: "returned", updatedAt: now } }
    );

    return jsonSuccess(
      {
        message: "Handover recorded successfully. Item is marked as returned.",
        returnRecord: {
          ...returnDoc,
          id: newReturnId.toString(),
        },
      },
      201
    );
  } catch (err) {
    console.error("POST /api/returns error:", err);
    return jsonError("Failed to record handover return", 500);
  }
}
