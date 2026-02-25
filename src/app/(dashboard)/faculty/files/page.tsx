import { CourseFileManager } from "@/components/CourseFileManager";
import { FacultySectionTabs } from "@/components/faculty/FacultySectionTabs";
import type { CourseFile } from "@/components/CourseFileManager/types";
import { readJsonFile } from "@/lib/jsonDb";

export const dynamic = "force-dynamic";

export default async function FacultyFilesPage() {
  const files = await readJsonFile<CourseFile[]>("courseFiles.json");
  const fileCategories = await readJsonFile<string[]>(
    "files/course-file-categories.json",
  );
  const fileTypes = await readJsonFile<string[]>(
    "files/course-file-types.json",
  );

  return (
    <main className="space-y-6">
      <FacultySectionTabs>
        <CourseFileManager
          initialFiles={files}
          fileCategories={fileCategories}
          fileTypes={fileTypes}
        />
      </FacultySectionTabs>
    </main>
  );
}
