"use server";
import JSZip from "jszip";
import { listProjectFiles } from "@/ai/tools/list-project-files";
import { readFile } from "@/ai/tools/read-file";
import type { ExportProjectOutput } from "@/lib/types";


export async function exportProjectFlow(): Promise<ExportProjectOutput> {
  const files = await listProjectFiles({});
  const zip = new JSZip();
  for (const file of files) {
    // We can ignore some files that are not useful for the user
    if (file.startsWith('node_modules/') || file.startsWith('.next/')) {
        continue;
    }
    try {
        const content = await readFile({ path: file });
        zip.file(file, content);
    } catch(e) {
        console.error(`Could not read file ${file}, skipping...`);
    }
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  return {
    zip: zipBlob,
  };
}
