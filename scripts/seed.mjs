import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDb, ensureIndexes } from "../src/lib/mongodb.js";

const config = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "config.json"), "utf-8")
);

export async function runSeed() {
  console.log("🌱 Starting Campus Lost & Found Seed Script...");

  const db = await getDb();
  await ensureIndexes();

  // 1. Categories
  console.log("-> Seeding categories...");
  const categoriesCol = db.collection("categories");
  const existingCategories = await categoriesCol.find({}).toArray();

  const categoryMap = {};
  for (const catName of config.defaultCategories) {
    let cat = existingCategories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    if (!cat) {
      const res = await categoriesCol.insertOne({
        _id: new ObjectId(),
        name: catName,
        createdAt: new Date(),
      });
      cat = { _id: res.insertedId, name: catName };
    }
    categoryMap[catName] = cat._id.toString();
  }

  // 2. Users
  console.log("-> Seeding users (Admin & Students)...");
  const usersCol = db.collection("users");

  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const studentPasswordHash = await bcrypt.hash("Student@123", 10);

  // Admin user
  let adminUser = await usersCol.findOne({ email: "admin@iu.ac.bd" });
  if (!adminUser) {
    const adminId = new ObjectId();
    await usersCol.insertOne({
      _id: adminId,
      name: "Desk Admin Officer",
      email: "admin@iu.ac.bd",
      password: adminPasswordHash,
      studentId: "ADMIN-001",
      department: "Computer Science & Engineering (CSE)",
      role: "admin",
      createdAt: new Date(),
    });
    adminUser = { _id: adminId };
  }

  // Student 1
  let student1 = await usersCol.findOne({ email: "student@iu.ac.bd" });
  if (!student1) {
    const s1Id = new ObjectId();
    await usersCol.insertOne({
      _id: s1Id,
      name: "Tanvir Hasan",
      email: "student@iu.ac.bd",
      password: studentPasswordHash,
      studentId: "2021-CSE-045",
      department: "Computer Science & Engineering (CSE)",
      role: "student",
      createdAt: new Date(),
    });
    student1 = { _id: s1Id };
  }

  // Student 2
  let student2 = await usersCol.findOne({ email: "nusrat@iu.ac.bd" });
  if (!student2) {
    const s2Id = new ObjectId();
    await usersCol.insertOne({
      _id: s2Id,
      name: "Nusrat Jahan",
      email: "nusrat@iu.ac.bd",
      password: studentPasswordHash,
      studentId: "2022-ICT-019",
      department: "Information & Communication Technology (ICT)",
      role: "student",
      createdAt: new Date(),
    });
    student2 = { _id: s2Id };
  }

  // Student 3
  let student3 = await usersCol.findOne({ email: "rahim@iu.ac.bd" });
  if (!student3) {
    const s3Id = new ObjectId();
    await usersCol.insertOne({
      _id: s3Id,
      name: "Rahim Ahmed",
      email: "rahim@iu.ac.bd",
      password: studentPasswordHash,
      studentId: "2020-EEE-033",
      department: "Electrical & Electronic Engineering (EEE)",
      role: "student",
      createdAt: new Date(),
    });
    student3 = { _id: s3Id };
  }

  // 3. Items
  console.log("-> Seeding campus lost & found items...");
  const itemsCol = db.collection("items");
  const claimsCol = db.collection("claims");
  const returnsCol = db.collection("returns");

  const existingItemsCount = await itemsCol.countDocuments({});
  if (existingItemsCount === 0) {
    const item1Id = new ObjectId();
    const item2Id = new ObjectId();
    const item3Id = new ObjectId();
    const item4Id = new ObjectId();
    const item5Id = new ObjectId();
    const item6Id = new ObjectId();

    const sampleItems = [
      {
        _id: item1Id,
        type: "found",
        title: "Casio fx-991EX Scientific Calculator",
        description:
          "Found a black Casio fx-991EX ClassWiz scientific calculator on the 3rd row desk after Numerical Analysis class. Has a small university sticker on the back cover.",
        categoryId: categoryMap["Electronics & Gadgets"],
        location: "CSE Building Room 302",
        dateOccurred: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "open",
        reportedBy: student1._id.toString(),
        contactPreference: "Handed over to CSE Department Office",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        _id: item2Id,
        type: "found",
        title: "Blue Tupperware Water Bottle and Spiral Notebook",
        description:
          "Found a dark blue water bottle along with a spiral-bound notebook containing Data Structures lecture notes.",
        categoryId: categoryMap["Books & Study Materials"],
        location: "Central Library 2nd Floor Reading Hall",
        dateOccurred: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "claim_pending",
        reportedBy: student2._id.toString(),
        contactPreference: "Left with Library Reception Desk",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        _id: item3Id,
        type: "found",
        title: "Brown Leather Wallet with Islamic University Student ID",
        description:
          "Brown leather wallet found near tea stall counter. Contains IU student ID card and bus ticket.",
        categoryId: categoryMap["Bags & Wallets"],
        location: "Main Cafeteria Counter",
        dateOccurred: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "returned",
        reportedBy: student1._id.toString(),
        contactPreference: "Submitted to Admin Desk",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        _id: item4Id,
        type: "lost",
        title: "HP Laptop Charger (65W Smart Blue Tip)",
        description:
          "Forgot my genuine HP 65W AC adapter in the software lab during the compiler lab exam. Has black electrical tape near the barrel jack.",
        categoryId: categoryMap["Electronics & Gadgets"],
        location: "CSE Software Lab 1",
        dateOccurred: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "open",
        reportedBy: student3._id.toString(),
        contactPreference: "Please contact me via email or CSE Department",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        _id: item5Id,
        type: "lost",
        title: "Department Seminar Library Card and Brass Key",
        description:
          "Lost a brass key with red plastic IU keychain and a laminated seminar library borrower card between the mosque and hall.",
        categoryId: categoryMap["Keys"],
        location: "Shaheed Ziaur Rahman Hall Pathway",
        dateOccurred: new Date().toISOString().split("T")[0],
        status: "open",
        reportedBy: student1._id.toString(),
        contactPreference: "Phone or email",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: item6Id,
        type: "found",
        title: "Titan Quartz Wristwatch with Silver Strap",
        description:
          "Silver metallic strap Titan analog watch found on the bleachers after badminton practice. Has date dial at 3 o'clock.",
        categoryId: categoryMap["Accessories & Watches"],
        location: "University Gymnasium & Swimming Pool",
        dateOccurred: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "open",
        reportedBy: student2._id.toString(),
        contactPreference: "Kept safely with gym caretaker",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ];

    await itemsCol.insertMany(sampleItems);

    // 4. Seed claims
    console.log("-> Seeding claims...");
    // Claim on item2 (claim_pending) by student1
    const claim1Id = new ObjectId();
    await claimsCol.insertOne({
      _id: claim1Id,
      itemId: item2Id.toString(),
      claimedBy: student1._id.toString(),
      proofDescription:
        "The notebook has my name 'Tanvir Hasan' written in blue ink on page 3, and the water bottle has a small scratch near the base.",
      status: "pending",
      reviewedBy: null,
      reviewNote: null,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      reviewedAt: null,
    });

    // Claim on item3 (approved & returned) by student3
    const claim2Id = new ObjectId();
    await claimsCol.insertOne({
      _id: claim2Id,
      itemId: item3Id.toString(),
      claimedBy: student3._id.toString(),
      proofDescription:
        "The brown wallet contains my student ID card (2020-EEE-033 Rahim Ahmed) and a Kushtia to IU shuttle bus ticket in the transparent slot.",
      status: "approved",
      reviewedBy: adminUser._id.toString(),
      reviewNote: "Physical ID details match student database. Approved for handover.",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    });

    // 5. Seed return for item 3
    console.log("-> Seeding handover return record...");
    await returnsCol.insertOne({
      _id: new ObjectId(),
      itemId: item3Id.toString(),
      claimId: claim2Id.toString(),
      receivedBy: "Rahim Ahmed (Student ID: 2020-EEE-033)",
      handedOverBy: adminUser._id.toString(),
      notes: "Student came to the Lost & Found desk in person. Verified original ID and signed the return register book.",
      returnedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    });
  }

  console.log("✅ Seed completed successfully!");
  return { success: true };
}

// Run directly if called as a script
if (process.argv[1] && process.argv[1].endsWith("seed.mjs")) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
