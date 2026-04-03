const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const UploadedFile = require("../models/UploadedFile");
const { connectDB, disconnectDB } = require("../config/mongodb.config");

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const REVIEW_STATUSES = new Set([
  "pending",
  "submitted",
  "in_review",
  "approved",
  "rejected",
]);

function getArg(flag, fallback = "") {
  const prefixed = `${flag}=`;
  const direct = process.argv.find((arg) => arg.startsWith(prefixed));
  if (direct) {
    return direct.slice(prefixed.length);
  }
  const index = process.argv.indexOf(flag);
  if (index >= 0 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return fallback;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function normalizeString(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function normalizeUpper(value) {
  return normalizeString(value).toUpperCase();
}

function normalizeLower(value) {
  return normalizeString(value).toLowerCase();
}

function normalizeStatus(value) {
  const normalized = normalizeLower(value || "pending");
  if (!normalized) return "pending";
  if (normalized === "in review") return "in_review";
  return REVIEW_STATUSES.has(normalized) ? normalized : "pending";
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDate(value, fallback = null) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function toObjectId(value) {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  return mongoose.isValidObjectId(value)
    ? new mongoose.Types.ObjectId(value)
    : null;
}

function normalizeLegacyItem(item) {
  const reviewInput =
    item.review && typeof item.review === "object" ? item.review : {};

  const facultyId = toObjectId(item.facultyId);
  if (!facultyId) {
    return { skip: true, reason: "Invalid facultyId" };
  }

  const fileName = normalizeString(
    item.fileName || item.originalFileName || item.name,
  );
  const originalFileName = normalizeString(
    item.originalFileName || item.fileName || item.name,
  );
  const filePath = normalizeString(
    item.filePath || item.documentUrl || item.storagePath,
  );

  if (!fileName || !originalFileName || !filePath) {
    return {
      skip: true,
      reason: "Missing required fileName/originalFileName/filePath",
    };
  }

  const review = {
    status: normalizeStatus(reviewInput.status || item.status),
    remarks: normalizeString(
      reviewInput.remarks || item.remarks || item.adminRemarks,
    ),
    facultyResponse: normalizeString(
      reviewInput.facultyResponse || item.facultyResponse,
    ),
  };

  const reviewedBy = toObjectId(reviewInput.reviewedBy || item.reviewedBy);
  if (reviewedBy) review.reviewedBy = reviewedBy;

  const reviewedAt = parseDate(reviewInput.reviewedAt || item.reviewedDate);
  if (reviewedAt) review.reviewedAt = reviewedAt;

  const responseDate = parseDate(reviewInput.responseDate || item.responseDate);
  if (responseDate) review.responseDate = responseDate;

  const auditScoreRaw = reviewInput.auditScore ?? item.auditScore;
  if (
    auditScoreRaw !== undefined &&
    auditScoreRaw !== null &&
    auditScoreRaw !== ""
  ) {
    const auditScore = toNumber(auditScoreRaw, NaN);
    if (Number.isFinite(auditScore) && auditScore >= 0 && auditScore <= 100) {
      review.auditScore = auditScore;
    }
  }

  const normalized = {
    fileName,
    originalFileName,
    filePath,
    fileSize: toNumber(item.fileSize ?? item.size, 0),
    fileType: normalizeLower(item.fileType || "other"),
    mimeType: normalizeLower(
      item.mimeType || item.mimetype || "application/octet-stream",
    ),
    facultyId,
    courseCode: normalizeUpper(item.courseCode),
    courseName: normalizeString(item.courseName),
    semester: normalizeLower(item.semester),
    academicYear: normalizeString(item.academicYear),
    uploadedAt: parseDate(item.uploadedAt || item.uploadDate, new Date()),
    review,
    legacyId: normalizeString(item.id),
    createdAt: parseDate(item.createdAt, new Date()),
    updatedAt: parseDate(item.updatedAt, new Date()),
  };

  return { skip: false, doc: normalized };
}

async function loadLegacyPayload(db, sourceCollection, sourceId) {
  const source = await db
    .collection(sourceCollection)
    .findOne({ _id: sourceId });

  if (source && Array.isArray(source.data)) {
    return {
      sourceDoc: source,
      items: source.data,
      sourceCollection,
      sourceId,
    };
  }

  if (sourceCollection !== "uploadedfiles") {
    const inUploadedFiles = await db
      .collection("uploadedfiles")
      .findOne({ _id: sourceId });
    if (inUploadedFiles && Array.isArray(inUploadedFiles.data)) {
      return {
        sourceDoc: inUploadedFiles,
        items: inUploadedFiles.data,
        sourceCollection: "uploadedfiles",
        sourceId,
      };
    }
  }

  return { sourceDoc: null, items: [], sourceCollection, sourceId };
}

async function run() {
  const sourceCollection = getArg("--sourceCollection", "jsonStore");
  const sourceId = getArg("--sourceId", "courseFiles.json");
  const dryRun = hasFlag("--dry-run");
  const deleteSource = hasFlag("--delete-source");

  await connectDB();
  const db = mongoose.connection.db;

  try {
    const payload = await loadLegacyPayload(db, sourceCollection, sourceId);

    if (!payload.sourceDoc || !payload.items.length) {
      console.log("No legacy course-files payload found. Nothing to migrate.");
      return;
    }

    console.log(
      `Found ${payload.items.length} records in ${payload.sourceCollection} document ${payload.sourceId}`,
    );

    const normalizedDocs = [];
    const skipped = [];

    payload.items.forEach((item, index) => {
      const normalized = normalizeLegacyItem(item || {});
      if (normalized.skip) {
        skipped.push({ index, reason: normalized.reason });
      } else {
        normalizedDocs.push(normalized.doc);
      }
    });

    console.log(
      `Prepared ${normalizedDocs.length} records for migration, skipped ${skipped.length}.`,
    );

    if (skipped.length) {
      skipped.slice(0, 20).forEach((entry) => {
        console.warn(`Skipped index=${entry.index}: ${entry.reason}`);
      });
      if (skipped.length > 20) {
        console.warn(`...and ${skipped.length - 20} more skipped records.`);
      }
    }

    if (dryRun) {
      console.log("Dry run complete. No data was written.");
      return;
    }

    const backupCollection = `legacy_coursefiles_backup_${Date.now()}`;
    await db.collection(backupCollection).insertOne({
      sourceCollection: payload.sourceCollection,
      sourceId: payload.sourceId,
      migratedAt: new Date(),
      sourceDoc: payload.sourceDoc,
    });

    const ops = normalizedDocs.map((doc) => {
      const filter = doc.legacyId
        ? { legacyId: doc.legacyId }
        : {
            facultyId: doc.facultyId,
            fileName: doc.fileName,
            courseCode: doc.courseCode,
            academicYear: doc.academicYear,
            uploadedAt: doc.uploadedAt,
          };

      return {
        updateOne: {
          filter,
          update: {
            $setOnInsert: doc,
            $set: { updatedAt: new Date() },
          },
          upsert: true,
        },
      };
    });

    const result = ops.length
      ? await UploadedFile.collection.bulkWrite(ops, { ordered: false })
      : { upsertedCount: 0, modifiedCount: 0, matchedCount: 0 };

    console.log("Migration write complete:");
    console.log(`  inserted=${result.upsertedCount || 0}`);
    console.log(`  matched=${result.matchedCount || 0}`);
    console.log(`  modified=${result.modifiedCount || 0}`);
    console.log(`  backupCollection=${backupCollection}`);

    await db.collection(payload.sourceCollection).updateOne(
      { _id: payload.sourceId },
      {
        $set: {
          migration: {
            targetCollection: "uploadedfiles",
            totalSourceRecords: payload.items.length,
            migratedRecords: normalizedDocs.length,
            skippedRecords: skipped.length,
            migratedAt: new Date(),
            backupCollection,
          },
        },
      },
    );

    if (deleteSource) {
      await db
        .collection(payload.sourceCollection)
        .deleteOne({ _id: payload.sourceId });
      console.log("Deleted legacy source document after successful migration.");
    }

    console.log("Legacy course-files migration finished successfully.");
  } finally {
    await disconnectDB();
  }
}

run().catch((error) => {
  console.error("Migration failed:", error);
  process.exitCode = 1;
});
