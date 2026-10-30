import { spawn } from "child_process";

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("Starting Next.js production server for e2e HTTP verification...");

  const server = spawn("cmd.exe", ["/c", "npm.cmd", "start", "--", "-p", "3005"], {
    stdio: "inherit",
    env: { ...process.env, PORT: "3005" },
  });

  const cleanup = () => {
    try {
      server.kill();
    } catch {
      // ignore
    }
  };

  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);

  // Poll until server is ready
  let serverReady = false;
  for (let i = 0; i < 20; i++) {
    await wait(1000);
    try {
      const res = await fetch("http://127.0.0.1:3005/api/categories");
      if (res.ok) {
        serverReady = true;
        break;
      }
    } catch {
      // still starting
    }
  }

  if (!serverReady) {
    console.error("Server did not start in time.");
    cleanup();
    process.exit(1);
  }

  console.log("\n🚀 Server is ready on http://127.0.0.1:3005! Running tests...\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Reseed via API
    console.log("Test 1: POST /api/seed");
    const seedRes = await fetch("http://127.0.0.1:3005/api/seed", { method: "POST" });
    const seedData = await seedRes.json();
    assert(seedRes.status === 200 && seedData.success, "Database seeded successfully via API");

    // 2. Fetch Categories
    console.log("\nTest 2: GET /api/categories");
    const catRes = await fetch("http://127.0.0.1:3005/api/categories");
    const catData = await catRes.json();
    assert(catRes.status === 200, "Categories API returns 200");
    assert(catData.categories?.length >= 5, `Fetched ${catData.categories?.length} categories`);
    const categoryId = catData.categories[0].id;

    // 3. Login as Student
    console.log("\nTest 3: POST /api/auth/login (Student)");
    const studentLoginRes = await fetch("http://127.0.0.1:3005/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student@iu.ac.bd", password: "Student@123" }),
    });
    const studentData = await studentLoginRes.json();
    assert(studentLoginRes.status === 200, "Student login successful");
    assert(studentData.user?.role === "student", "Role is student");
    const studentToken = studentData.token;

    // 4. Login as Admin
    console.log("\nTest 4: POST /api/auth/login (Admin)");
    const adminLoginRes = await fetch("http://127.0.0.1:3005/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@iu.ac.bd", password: "Admin@123" }),
    });
    const adminData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, "Admin login successful");
    assert(adminData.user?.role === "admin", "Role is admin");
    const adminToken = adminData.token;

    // 5. Check Session /api/auth/me
    console.log("\nTest 5: GET /api/auth/me");
    const meRes = await fetch("http://127.0.0.1:3005/api/auth/me", {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, "/api/auth/me returns 200");
    assert(meData.user?.email === "student@iu.ac.bd", "Verified current user email");

    // 6. Post New Item Report
    console.log("\nTest 6: POST /api/items");
    const postItemRes = await fetch("http://127.0.0.1:3005/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        type: "found",
        title: "Casio FX-991CW Calculator Found",
        description: "Found in CSE Room 304 during exam hour. Clean condition.",
        categoryId,
        location: "CSE Building Room 304",
        dateOccurred: new Date().toISOString().split("T")[0],
        contactPreference: "Handed over to Dept Office",
      }),
    });
    const postItemData = await postItemRes.json();
    assert(postItemRes.status === 201, "Created item report with status 201");
    const createdItemId = postItemData.item?.id || postItemData.item?._id;

    // 7. GET /api/items (Browse & Filter)
    console.log("\nTest 7: GET /api/items?type=found&page=1&limit=9");
    const browseRes = await fetch("http://127.0.0.1:3005/api/items?type=found&page=1&limit=9");
    const browseData = await browseRes.json();
    assert(browseRes.status === 200, "Browse items returned 200 with ?type=found&page=1&limit=9");
    assert(browseData.items?.length > 0, `Browse returned ${browseData.items.length} items`);

    // 8. View Item Details
    console.log(`\nTest 8: GET /api/items/${createdItemId}`);
    const detailsRes = await fetch(`http://127.0.0.1:3005/api/items/${createdItemId}`);
    const detailsData = await detailsRes.json();
    assert(detailsRes.status === 200, "Item details returned 200");
    assert(detailsData.item?.title.includes("Casio"), "Item title verified");

    // 9. Register a second student to claim the item
    console.log("\nTest 9: POST /api/auth/register");
    const regRes = await fetch("http://127.0.0.1:3005/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Farhana Akter",
        email: `farhana_${Date.now()}@iu.ac.bd`,
        studentId: `2023-ICT-${Math.floor(100 + Math.random() * 900)}`,
        department: "Information & Communication Technology (ICT)",
        password: "Password@123",
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, "New student registered successfully");
    const claimantToken = regData.token;

    // 10. Claimant submits claim on the found item
    console.log("\nTest 10: POST /api/claims");
    const claimRes = await fetch("http://127.0.0.1:3005/api/claims", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${claimantToken}`,
      },
      body: JSON.stringify({
        itemId: createdItemId,
        proofDescription: "The back battery lid has a green dot sticker and initials 'FA'.",
      }),
    });
    const claimData = await claimRes.json();
    assert(claimRes.status === 201, "Claim submitted with status 201");
    const claimId = claimData.claim?.id || claimData.claim?._id;

    // 11. Verify item transitioned to 'claim_pending'
    const itemPendingRes = await fetch(`http://127.0.0.1:3005/api/items/${createdItemId}`);
    const itemPendingData = await itemPendingRes.json();
    assert(
      itemPendingData.item?.status === "claim_pending",
      "Item status transitioned to 'claim_pending'"
    );

    // 12. Admin reviews and approves claim
    console.log(`\nTest 12: PUT /api/claims/${claimId} (Admin Approval)`);
    const reviewRes = await fetch(`http://127.0.0.1:3005/api/claims/${claimId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: "approved",
        reviewNote: "Green dot sticker verified on calculator back cover.",
      }),
    });
    const reviewData = await reviewRes.json();
    assert(reviewRes.status === 200, "Claim approved by admin");
    assert(reviewData.claim?.status === "approved", "Claim status is approved");

    // 13. Admin records handover return
    console.log("\nTest 13: POST /api/returns (Admin Handover)");
    const returnRes = await fetch("http://127.0.0.1:3005/api/returns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        itemId: createdItemId,
        claimId,
        receivedBy: "Farhana Akter (2023-ICT)",
        notes: "Student verified identity with semester admit card and signed register.",
      }),
    });
    const returnData = await returnRes.json();
    assert(returnRes.status === 201, "Handover recorded with status 201");

    // 14. Verify item transitioned to 'returned'
    const itemReturnedRes = await fetch(`http://127.0.0.1:3005/api/items/${createdItemId}`);
    const itemReturnedData = await itemReturnedRes.json();
    assert(
      itemReturnedData.item?.status === "returned",
      "Item status transitioned to 'returned'"
    );

    // 15. Admin Reports & Analytics
    console.log("\nTest 15: GET /api/reports");
    const reportsRes = await fetch("http://127.0.0.1:3005/api/reports", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const reportsData = await reportsRes.json();
    assert(reportsRes.status === 200, "Admin reports returned 200");
    assert(reportsData.metrics?.totalItems > 0, "Metrics total items count verified");
    assert(reportsData.recentReturns?.length > 0, "Recent returns log contains records");

    console.log("\n==========================================");
    console.log(`TOTAL TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log("==========================================");

    cleanup();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution error:", err);
    cleanup();
    process.exit(1);
  }
}

run();
