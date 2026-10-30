import { MongoClient, ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import config from "./config.js";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/lost_and_found";
const options = {
  serverSelectionTimeoutMS: 2500, // fast fail to fallback if no Mongo daemon is active
};

let client;
let clientPromise;

// In-Memory / File Fallback Store for offline / demo mode
class FallbackCollection {
  constructor(name, getStore, saveStore) {
    this.name = name;
    this.getStore = getStore;
    this.saveStore = saveStore;
  }

  _docs() {
    const store = this.getStore();
    if (!store[this.name]) store[this.name] = [];
    return store[this.name];
  }

  find(query = {}) {
    const docs = this._docs();
    const filtered = docs.filter((doc) => this._matches(doc, query));

    const createCursor = (items) => ({
      sort: (sortObj = {}) => {
        const sorted = [...items].sort((a, b) => {
          for (const [key, dir] of Object.entries(sortObj)) {
            const valA = a[key];
            const valB = b[key];
            if (valA === valB) continue;
            if (valA === undefined) return 1;
            if (valB === undefined) return -1;
            const factor = dir === -1 ? -1 : 1;
            if (valA instanceof Date && valB instanceof Date) {
              return (valA.getTime() - valB.getTime()) * factor;
            }
            if (typeof valA === "string") {
              return valA.localeCompare(valB) * factor;
            }
            return (valA > valB ? 1 : -1) * factor;
          }
          return 0;
        });
        return createCursor(sorted);
      },
      skip: (skipCount = 0) => createCursor(items.slice(skipCount)),
      limit: (limitCount = 0) =>
        createCursor(limitCount > 0 ? items.slice(0, limitCount) : items),
      toArray: async () => JSON.parse(JSON.stringify(items)),
    });

    return createCursor(filtered);
  }

  async findOne(query = {}) {
    const docs = this._docs();
    const doc = docs.find((d) => this._matches(d, query));
    return doc ? JSON.parse(JSON.stringify(doc)) : null;
  }

  async insertOne(doc) {
    const docs = this._docs();
    const newDoc = {
      ...doc,
      _id: doc._id || new ObjectId().toString(),
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    };
    docs.push(newDoc);
    this.saveStore();
    return { insertedId: newDoc._id, acknowledged: true };
  }

  async insertMany(docsArr) {
    const insertedIds = {};
    const docs = this._docs();
    docsArr.forEach((doc, idx) => {
      const newDoc = {
        ...doc,
        _id: doc._id || new ObjectId().toString(),
        createdAt: doc.createdAt || new Date(),
        updatedAt: doc.updatedAt || new Date(),
      };
      docs.push(newDoc);
      insertedIds[idx] = newDoc._id;
    });
    this.saveStore();
    return { insertedIds, acknowledged: true };
  }

  async updateOne(query, update) {
    const docs = this._docs();
    const index = docs.findIndex((d) => this._matches(d, query));
    if (index === -1) return { matchedCount: 0, modifiedCount: 0 };
    const current = docs[index];
    if (update.$set) {
      Object.assign(current, update.$set, { updatedAt: new Date() });
    }
    this.saveStore();
    return { matchedCount: 1, modifiedCount: 1, acknowledged: true };
  }

  async deleteOne(query) {
    const docs = this._docs();
    const index = docs.findIndex((d) => this._matches(d, query));
    if (index === -1) return { deletedCount: 0 };
    docs.splice(index, 1);
    this.saveStore();
    return { deletedCount: 1, acknowledged: true };
  }

  async countDocuments(query = {}) {
    const docs = this._docs();
    return docs.filter((d) => this._matches(d, query)).length;
  }

  async createIndex() {
    return "index_created";
  }

  _matches(doc, query) {
    for (const [key, value] of Object.entries(query)) {
      if (key === "$text" && value.$search) {
        const searchWords = value.$search.toLowerCase().split(/\s+/);
        const textToSearch = `${doc.title || ""} ${doc.description || ""} ${doc.location || ""}`.toLowerCase();
        const matched = searchWords.some((word) => textToSearch.includes(word));
        if (!matched) return false;
        continue;
      }
      if (key === "_id") {
        const queryId = value?.toString();
        const docId = doc._id?.toString();
        if (queryId !== docId) return false;
        continue;
      }
      if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
        if ("$in" in value) {
          const docVal = doc[key]?.toString();
          const inArr = value.$in.map((v) => v?.toString());
          if (!inArr.includes(docVal)) return false;
          continue;
        }
        if ("$gte" in value || "$lte" in value) {
          const docDate = new Date(doc[key]);
          if (value.$gte && docDate < new Date(value.$gte)) return false;
          if (value.$lte && docDate > new Date(value.$lte)) return false;
          continue;
        }
        if ("$regex" in value) {
          const re = new RegExp(value.$regex, value.$options || "i");
          if (!re.test(doc[key] || "")) return false;
          continue;
        }
      }
      if (doc[key]?.toString() !== value?.toString()) {
        return false;
      }
    }
    return true;
  }
}

// Memory / File fallback DB instance
class FallbackDb {
  constructor() {
    this.filePath = path.join(process.cwd(), ".fallback-db.json");
    this.store = this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        return JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
      }
    } catch {
      // ignore
    }
    return {
      users: [],
      items: [],
      claims: [],
      categories: [],
      returns: [],
      sessions: [],
      accounts: [],
    };
  }

  _save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.store, null, 2));
    } catch {
      // ignore
    }
  }

  collection(name) {
    return new FallbackCollection(name, () => this.store, () => this._save());
  }
}

let fallbackDbInstance = null;
function getFallbackDb() {
  if (!fallbackDbInstance) {
    fallbackDbInstance = new FallbackDb();
  }
  return fallbackDbInstance;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.warn(
        `[MongoDB] Note: Direct connection to ${uri} not established (${err.message}). Using local high-performance fallback store.`
      );
      return null;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch(() => null);
}

export async function getDb() {
  try {
    const c = await clientPromise;
    if (c) {
      return c.db();
    }
  } catch {
    // fallback below
  }
  return getFallbackDb();
}

export async function isLiveMongo() {
  try {
    const c = await clientPromise;
    if (c) {
      await c.db().command({ ping: 1 });
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}

// PRD Section 7: Indexes setup
export async function ensureIndexes() {
  try {
    const db = await getDb();
    const items = db.collection("items");
    const claims = db.collection("claims");
    const users = db.collection("users");

    await items.createIndex({ status: 1, type: 1, createdAt: -1 });
    await items.createIndex({ title: "text", description: "text" });
    await claims.createIndex({ itemId: 1, status: 1 });
    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ studentId: 1 }, { unique: true, sparse: true });
  } catch (err) {
    console.warn("[MongoDB] Index creation note:", err.message);
  }
}

export { ObjectId };
export default clientPromise;
