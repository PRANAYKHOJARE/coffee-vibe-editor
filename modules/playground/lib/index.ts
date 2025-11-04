// modules/playground/lib/file-utils.ts
// Helper utilities for template file path / id generation

import { TemplateFile, TemplateFolder } from "./path-to-json";

/**
 * Recursively find the file path (relative to rootFolder) for a TemplateFile.
 * Returns a string like "src/components/Button.tsx" or null if not found.
 */
export function findFilePath(
  file: TemplateFile,
  folder: TemplateFolder,
  pathSoFar: string[] = []
): string | null {
  for (const item of folder.items) {
    if ("folderName" in item) {
      const res = findFilePath(file, item, [...pathSoFar, item.folderName]);
      if (res) return res;
    } else {
      // item is a TemplateFile
      if (
        item.filename === file.filename &&
        // use optional chaining in case fileExtension is undefined
        (item.fileExtension ?? "") === (file.fileExtension ?? "")
      ) {
        const filenameWithExt =
          item.filename + (item.fileExtension ? "." + item.fileExtension : "");
        return [...pathSoFar, filenameWithExt].join("/");
      }
    }
  }

  // not found in this folder tree
  return null;
}

/**
 * Generate unique file id based on file location in folder structure
 * The returned id will prefer the full path when available; otherwise returns filename + extension.
 *
 * Examples:
 * - "src/components/Button.tsx"
 * - "index.js"
 */
export const generateFileId = (
  file: TemplateFile,
  rootFolder: TemplateFolder
): string => {
  // Find the file's path relative to rootFolder (includes filename + extension)
  const foundPath = findFilePath(file, rootFolder); // e.g. "src/components/Button.tsx" or null

  // If foundPath exists, return it; otherwise build filename + extension fallback
  if (foundPath && foundPath.trim() !== "") {
    return foundPath.replace(/^\/+/, ""); // remove any leading slashes just in case
  }

  const extension = (file.fileExtension ?? "").trim();
  return extension ? `${file.filename}.${extension}` : file.filename;
};
