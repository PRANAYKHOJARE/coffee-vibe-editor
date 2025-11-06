import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

/**
 * Represents a file in the template structure
 */
export interface TemplateFile {
  id: string;
  type: "file";
  filename: string;
  fileExtension: string;
  content: string;
}

/**
 * Represents a folder in the template structure which can contain files and other folders
 */
export interface TemplateFolder {
  id: string;
  type: "folder";
  folderName: string;
  items: (TemplateFile | TemplateFolder)[];
}

/**
 * Type representing either a file or folder in the template structure
 */
export type TemplateItem = TemplateFile | TemplateFolder;

/**
 * Options for scanning template directories
 */
interface ScanOptions {
  ignoreFiles?: string[];
  ignoreFolders?: string[];
  ignorePatterns?: RegExp[];
  maxFileSize?: number;
}

/**
 * Scans a template directory and returns a structured JSON representation
 */
export async function scanTemplateDirectory(
  templatePath: string,
  options: ScanOptions = {}
): Promise<TemplateFolder> {
  const defaultOptions: ScanOptions = {
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      ".DS_Store",
      "thumbs.db",
      ".gitignore",
      ".npmrc",
      ".yarnrc",
      ".env",
      ".env.local",
      ".env.development",
      ".env.production",
    ],
    ignoreFolders: [
      "node_modules",
      ".git",
      ".vscode",
      ".idea",
      "dist",
      "build",
      "coverage",
    ],
    ignorePatterns: [/^\..+\.swp$/, /^\.#/, /~$/],
    maxFileSize: 1024 * 1024, // 1MB
  };

  const mergedOptions: ScanOptions = {
    ignoreFiles: [
      ...(defaultOptions.ignoreFiles || []),
      ...(options.ignoreFiles || []),
    ],
    ignoreFolders: [
      ...(defaultOptions.ignoreFolders || []),
      ...(options.ignoreFolders || []),
    ],
    ignorePatterns: [
      ...(defaultOptions.ignorePatterns || []),
      ...(options.ignorePatterns || []),
    ],
    maxFileSize: options.maxFileSize ?? defaultOptions.maxFileSize,
  };

  if (!templatePath) throw new Error("Template path is required");

  try {
    const stats = await fs.promises.stat(templatePath);
    if (!stats.isDirectory())
      throw new Error(`'${templatePath}' is not a directory`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Template directory '${templatePath}' does not exist`);
    }
    throw error;
  }

  const folderName = path.basename(templatePath);
  return processDirectory(folderName, templatePath, mergedOptions);
}

/**
 * Process a directory and its contents recursively
 */
async function processDirectory(
  folderName: string,
  folderPath: string,
  options: ScanOptions
): Promise<TemplateFolder> {
  const entries = await fs.promises.readdir(folderPath, {
    withFileTypes: true,
  });
  const items: TemplateItem[] = [];

  for (const entry of entries) {
    const entryName = entry.name;
    const entryPath = path.join(folderPath, entryName);

    if (entry.isDirectory()) {
      if (options.ignoreFolders?.includes(entryName)) continue;

      const subFolder = await processDirectory(entryName, entryPath, options);
      items.push(subFolder);
    } else if (entry.isFile()) {
      if (options.ignoreFiles?.includes(entryName)) continue;

      const shouldSkip = options.ignorePatterns?.some((pattern) =>
        pattern.test(entryName)
      );
      if (shouldSkip) continue;

      try {
        const stats = await fs.promises.stat(entryPath);
        const parsedPath = path.parse(entryName);
        let content: string;

        if (options.maxFileSize && stats.size > options.maxFileSize) {
          content = `[File content not included: ${stats.size} bytes > ${options.maxFileSize} bytes]`;
        } else {
          content = await fs.promises.readFile(entryPath, "utf8");
        }

        items.push({
          id: crypto.randomUUID(),
          type: "file",
          filename: parsedPath.name,
          fileExtension: parsedPath.ext.replace(/^\./, ""),
          content,
        });
      } catch (error) {
        const parsedPath = path.parse(entryName);
        items.push({
          id: crypto.randomUUID(),
          type: "file",
          filename: parsedPath.name,
          fileExtension: parsedPath.ext.replace(/^\./, ""),
          content: `Error reading file: ${(error as Error).message}`,
        });
      }
    }
  }

  return {
    id: crypto.randomUUID(),
    type: "folder",
    folderName,
    items,
  };
}

/**
 * Saves the template structure to a JSON file
 */
export async function saveTemplateStructureToJson(
  templatePath: string,
  outputPath: string,
  options?: ScanOptions
): Promise<void> {
  const templateStructure = await scanTemplateDirectory(templatePath, options);
  const outputDir = path.dirname(outputPath);
  await fs.promises.mkdir(outputDir, { recursive: true });
  await fs.promises.writeFile(
    outputPath,
    JSON.stringify(templateStructure, null, 2),
    "utf8"
  );
  console.log(`✅ Template structure saved to ${outputPath}`);
}

/**
 * Reads a template structure JSON file back into an object
 */
export async function readTemplateStructureFromJson(
  filePath: string
): Promise<TemplateFolder> {
  const data = await fs.promises.readFile(filePath, "utf8");
  return JSON.parse(data) as TemplateFolder;
}
