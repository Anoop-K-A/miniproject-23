import { MongoClient } from "mongodb";

async function deleteAllStudents() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "miniproject";

  if (!uri) {
    console.error("❌ MONGODB_URI environment variable not set");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB");

    const db = client.db(dbName);

    // Delete students from the JSON store collection
    const result = await db.collection("json_store").deleteOne({
      _id: "students.json",
    });

    if (result.deletedCount > 0) {
      console.log("✓ Deleted students.json from MongoDB");
    } else {
      console.log("⚠ No students.json found in MongoDB");
    }

    // Verify deletion
    const check = await db.collection("json_store").findOne({
      _id: "students.json",
    });

    if (!check) {
      console.log("✅ All students deleted successfully!");
    }
  } catch (error) {
    console.error("❌ Error deleting students:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

deleteAllStudents();
