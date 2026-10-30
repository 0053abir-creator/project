import { getCollection, ObjectId } from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import { jsonSuccess, jsonError, toObjectId } from "@/lib/helpers";

export const dynamic = "force-dynamic";

// GET /api/reports - Admin
export async function GET(request) {
  try {
    const authRes = await requireRole(request, "admin");
    if (authRes.error) {
      return jsonError(authRes.error, authRes.status);
    }

    const itemsCol = await getCollection("items");
    const claimsCol = await getCollection("claims");
    const categoriesCol = await getCollection("categories");
    const returnsCol = await getCollection("returns");
    const usersCol = await getCollection("users");

    // All items
    const allItems = await itemsCol.find({}).toArray();

    // Counts by status
    const statusCounts = {
      open: 0,
      claim_pending: 0,
      returned: 0,
      closed: 0,
    };

    // Counts by type
    const typeCounts = {
      lost: 0,
      found: 0,
    };

    // Counts by category
    const categoryCountsMap = {};
    allItems.forEach((item) => {
      if (statusCounts[item.status] !== undefined) {
        statusCounts[item.status]++;
      }
      if (typeCounts[item.type] !== undefined) {
        typeCounts[item.type]++;
      }
      const catId = item.categoryId ? item.categoryId.toString() : "uncategorized";
      categoryCountsMap[catId] = (categoryCountsMap[catId] || 0) + 1;
    });

    const allCategories = await categoriesCol.find({}).toArray();
    const categoryBreakdown = allCategories.map((cat) => ({
      id: cat._id.toString(),
      name: cat.name,
      count: categoryCountsMap[cat._id.toString()] || 0,
    }));

    // Items reported per week (recent 6 weeks)
    const now = new Date();
    const weeklyData = [];
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const count = allItems.filter((item) => {
        const d = new Date(item.createdAt);
        return d >= weekStart && d < weekEnd;
      }).length;

      const label = `Week -${i === 0 ? "current" : i}`;
      weeklyData.push({
        label,
        start: weekStart.toISOString().split("T")[0],
        end: weekEnd.toISOString().split("T")[0],
        count,
      });
    }

    // Pending claims queue
    const pendingClaimsRaw = await claimsCol
      .find({ status: "pending" })
      .sort({ createdAt: -1 })
      .toArray();

    const pendingClaims = await Promise.all(
      pendingClaimsRaw.map(async (claim) => {
        let itemTitle = "Item";
        let itemType = "found";
        let itemLocation = "";

        if (claim.itemId) {
          const item = await itemsCol.findOne({ _id: toObjectId(claim.itemId) });
          if (item) {
            itemTitle = item.title;
            itemType = item.type;
            itemLocation = item.location;
          }
        }

        let claimantName = "Student";
        let claimantDept = "";
        let claimantStudentId = "";
        if (claim.claimedBy) {
          const user = await usersCol.findOne({ _id: toObjectId(claim.claimedBy) });
          if (user) {
            claimantName = user.name;
            claimantDept = user.department || "";
            claimantStudentId = user.studentId || "";
          }
        }

        return {
          id: claim._id.toString(),
          itemId: claim.itemId,
          itemTitle,
          itemType,
          itemLocation,
          claimedBy: claim.claimedBy,
          claimantName,
          claimantDept,
          claimantStudentId,
          proofDescription: claim.proofDescription,
          createdAt: claim.createdAt,
        };
      })
    );

    // Recent returns
    const recentReturnsRaw = await returnsCol
      .find({})
      .sort({ returnedAt: -1 })
      .limit(10)
      .toArray();

    const recentReturns = await Promise.all(
      recentReturnsRaw.map(async (ret) => {
        let itemTitle = "Item";
        if (ret.itemId) {
          const item = await itemsCol.findOne({ _id: toObjectId(ret.itemId) });
          if (item) itemTitle = item.title;
        }

        let handedOverByName = "Admin";
        if (ret.handedOverBy) {
          const officer = await usersCol.findOne({ _id: toObjectId(ret.handedOverBy) });
          if (officer) handedOverByName = officer.name;
        }

        return {
          id: ret._id.toString(),
          itemTitle,
          receivedBy: ret.receivedBy,
          handedOverByName,
          notes: ret.notes,
          returnedAt: ret.returnedAt,
        };
      })
    );

    return jsonSuccess({
      metrics: {
        totalItems: allItems.length,
        statusCounts,
        typeCounts,
        pendingClaimsCount: pendingClaims.length,
        returnedCount: statusCounts.returned,
      },
      categoryBreakdown,
      weeklyReported: weeklyData,
      pendingClaimsQueue: pendingClaims,
      recentReturns,
    });
  } catch (err) {
    console.error("GET /api/reports error:", err);
    return jsonError("Failed to fetch reports", 500);
  }
}
