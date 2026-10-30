import { getCollection, ObjectId } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import {
  jsonSuccess,
  jsonError,
  validateClaimInput,
  toObjectId,
  CLAIM_STATUS_CONFIG,
} from "@/lib/helpers";

export const dynamic = "force-dynamic";

// GET /api/claims - Student, admin
export async function GET(request) {
  try {
    const authRes = await requireAuth(request);
    if (authRes.error) {
      return jsonError(authRes.error, authRes.status);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const itemId = searchParams.get("itemId") || "";

    const claimsCol = await getCollection("claims");
    const itemsCol = await getCollection("items");
    const usersCol = await getCollection("users");

    const query = {};

    // Role check: Student can only see their own claims. Admin can see all.
    if (authRes.user.role !== "admin") {
      query.claimedBy = authRes.user.id;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (itemId) {
      query.itemId = itemId;
    }

    const claims = await claimsCol.find(query).sort({ createdAt: -1 }).toArray();

    // Populate item details & claimant info
    const populatedClaims = await Promise.all(
      claims.map(async (claim) => {
        let itemInfo = null;
        if (claim.itemId) {
          const item = await itemsCol.findOne({ _id: toObjectId(claim.itemId) });
          if (item) {
            itemInfo = {
              id: item._id.toString(),
              title: item.title,
              type: item.type,
              status: item.status,
              location: item.location,
              dateOccurred: item.dateOccurred,
            };
          }
        }

        let claimantInfo = { name: "Student", studentId: "N/A", department: "N/A" };
        if (claim.claimedBy) {
          const claimant = await usersCol.findOne({ _id: toObjectId(claim.claimedBy) });
          if (claimant) {
            claimantInfo = {
              id: claimant._id.toString(),
              name: claimant.name,
              email: claimant.email,
              studentId: claimant.studentId || "N/A",
              department: claimant.department || "N/A",
            };
          }
        }

        return {
          id: claim._id.toString(),
          _id: claim._id.toString(),
          itemId: claim.itemId,
          item: itemInfo,
          claimedBy: claim.claimedBy,
          claimant: claimantInfo,
          proofDescription: claim.proofDescription,
          status: claim.status,
          statusMeta: CLAIM_STATUS_CONFIG[claim.status] || CLAIM_STATUS_CONFIG.pending,
          reviewedBy: claim.reviewedBy,
          reviewNote: claim.reviewNote,
          createdAt: claim.createdAt,
          reviewedAt: claim.reviewedAt,
        };
      })
    );

    return jsonSuccess({ claims: populatedClaims });
  } catch (err) {
    console.error("GET /api/claims error:", err);
    return jsonError("Failed to fetch claims", 500);
  }
}

// POST /api/claims - Student
export async function POST(request) {
  try {
    const authRes = await requireAuth(request);
    if (authRes.error) {
      return jsonError(authRes.error, authRes.status);
    }

    const body = await request.json();
    const validation = validateClaimInput(body);

    if (!validation.isValid) {
      return jsonError("Validation failed", 400, validation.errors);
    }

    const { itemId, proofDescription } = body;
    const itemsCol = await getCollection("items");
    const claimsCol = await getCollection("claims");

    let item = await itemsCol.findOne({ _id: toObjectId(itemId) });
    if (!item) item = await itemsCol.findOne({ _id: itemId });

    if (!item) {
      return jsonError("Target item not found.", 404);
    }

    // PRD 6.3: Item must be 'open'
    if (item.status !== "open") {
      return jsonError(`Item cannot be claimed as it is currently '${item.status}'.`, 400);
    }

    // PRD 6.3: Students cannot claim their own report
    if (item.reportedBy && item.reportedBy.toString() === authRes.user.id.toString()) {
      return jsonError("You cannot claim an item report that you posted yourself.", 403);
    }

    // PRD 6.3: One active claim per item
    const existingActiveClaim = await claimsCol.findOne({
      itemId: item._id.toString(),
      status: { $in: ["pending", "approved"] },
    });

    if (existingActiveClaim) {
      return jsonError(
        "There is already an active claim under review for this item.",
        409
      );
    }

    const newClaimId = new ObjectId();
    const newClaim = {
      _id: newClaimId,
      itemId: item._id.toString(),
      claimedBy: authRes.user.id,
      proofDescription: proofDescription.trim(),
      status: "pending",
      reviewedBy: null,
      reviewNote: null,
      createdAt: new Date(),
      reviewedAt: null,
    };

    await claimsCol.insertOne(newClaim);

    // PRD 6.3: Item becomes 'claim_pending'
    await itemsCol.updateOne(
      { _id: item._id },
      { $set: { status: "claim_pending", updatedAt: new Date() } }
    );

    return jsonSuccess(
      {
        message: "Claim submitted successfully. Desk admin will review your proof.",
        claim: {
          ...newClaim,
          id: newClaimId.toString(),
        },
      },
      201
    );
  } catch (err) {
    console.error("POST /api/claims error:", err);
    return jsonError("Failed to submit claim", 500);
  }
}
