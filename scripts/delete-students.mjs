import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function deleteAllStudents() {
  try {
    console.log("Starting student deletion...");

    // Delete in order of dependencies (child tables first)
    const studentActivitiesDeleted = await prisma.student_activities.deleteMany(
      {},
    );
    console.log(
      `✓ Deleted ${studentActivitiesDeleted.count} student activities`,
    );

    const studentDocumentsDeleted = await prisma.student_document.deleteMany(
      {},
    );
    console.log(`✓ Deleted ${studentDocumentsDeleted.count} student documents`);

    const internshipsDeleted = await prisma.internships.deleteMany({});
    console.log(`✓ Deleted ${internshipsDeleted.count} internships`);

    const studentsDeleted = await prisma.student.deleteMany({});
    console.log(`✓ Deleted ${studentsDeleted.count} students`);

    console.log(
      "\n✅ All students and related data have been deleted successfully!",
    );
  } catch (error) {
    console.error("❌ Error deleting students:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllStudents();
