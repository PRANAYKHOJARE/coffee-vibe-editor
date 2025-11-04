import * as fs from "fs";
import * as path from "path";

/**
 * Represents a file in template structure
 */
export interface TemplateFile {
  filename: string;
  fileExtension: string;
  content: string;
}

/**
 * Represents a folder in the template structure which can contain files and other folders
 */
export interface TemplateFolder {
  folderName: string;
  items: (TemplateFile | TemplateFolder)[];
}

/**
 * Type representing either a file or folder in template structure
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
  outputJsonPath?: string;
}

/**
 * Metadata stored with the JSON output
 */
interface TemplateMetadata {
  totalFiles: number;
  totalFolders: number;
  generatedAt: string;
  rootFolder: string;
}

/**
 * Full JSON output type
 */
export interface TemplateStructureJSON {
  metadata: TemplateMetadata;
  structure: TemplateFolder;
}

/**
 * Scans a template directory and returns a structured JSON representation
 */
export async function scanTemplateDirectory(
  templatePath: string,
  options: ScanOptions = {}
): Promise<TemplateStructureJSON> {
  const defaultOptions: ScanOptions = {
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      ".DS_Store",
      "thumb.db",
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
    maxFileSize:
      options.maxFileSize !== undefined
        ? options.maxFileSize
        : defaultOptions.maxFileSize,
    outputJsonPath: options.outputJsonPath,
  };

  if (!templatePath) {
    throw new Error("Template path is required");
  }

  const stats = await fs.promises.stat(templatePath);
  if (!stats.isDirectory()) {
    throw new Error(`'${templatePath}' is not a directory`);
  }

  let totalFiles = 0;
  let totalFolders = 0;

  async function scanDirectory(dirPath: string): Promise<TemplateFolder> {
    totalFolders++;
    const folderName = path.basename(dirPath);
    const items: (TemplateFile | TemplateFolder)[] = [];
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (mergedOptions.ignoreFolders?.includes(entry.name)) continue;
        const subFolder = await scanDirectory(fullPath);
        items.push(subFolder);
      } else {
        if (mergedOptions.ignoreFiles?.includes(entry.name)) continue;
        if (
          mergedOptions.ignorePatterns?.some((pattern) =>
            pattern.test(entry.name)
          )
        )
          continue;

        const stats = await fs.promises.stat(fullPath);
        totalFiles++;
        let content: string;

        if (stats.size > (mergedOptions.maxFileSize ?? 1024 * 1024)) {
          content = `/* File too large (${stats.size} bytes), skipped */`;
        } else {
          content = await fs.promises.readFile(fullPath, "utf8");
        }

        items.push({
          filename: entry.name,
          fileExtension: path.extname(entry.name),
          content,
        });
      }
    }

    return { folderName, items };
  }

  const structure = await scanDirectory(templatePath);

  const metadata: TemplateMetadata = {
    totalFiles,
    totalFolders,
    generatedAt: new Date().toISOString(),
    rootFolder: path.basename(templatePath),
  };

  const fullStructure: TemplateStructureJSON = {
    metadata,
    structure,
  };

  // Save JSON if requested
  if (mergedOptions.outputJsonPath) {
    await saveTemplateStructureToJson(
      fullStructure,
      mergedOptions.outputJsonPath
    );
  }

  return fullStructure;
}

/**
 * Saves template structure to JSON file
 */
export async function saveTemplateStructureToJson(
  structure: TemplateStructureJSON,
  outputPath: string
): Promise<void> {
  const resolvedPath = path.resolve(outputPath);
  await fs.promises.writeFile(
    resolvedPath,
    JSON.stringify(structure, null, 2),
    "utf8"
  );
  console.log(`✅ Template structure saved to: ${resolvedPath}`);
}

/**
 * Reads a template structure from JSON file
 */
export async function readTemplateStructureFromJson(
  filePath: string
): Promise<TemplateStructureJSON> {
  if (!filePath) throw new Error("JSON file path is required");

  const data = await fs.promises.readFile(filePath, "utf8");
  const parsed: TemplateStructureJSON = JSON.parse(data);

  if (!parsed.structure?.folderName || !parsed.structure?.items) {
    throw new Error("Invalid JSON structure");
  }

  console.log(`✅ Template structure loaded from: ${filePath}`);
  return parsed;
}

/**
 * Recreates folder & file structure from TemplateFolder
 */
export async function createStructureFromTemplate(
  structure: TemplateFolder,
  targetPath: string
): Promise<void> {
  const dirPath = path.join(targetPath, structure.folderName);
  await fs.promises.mkdir(dirPath, { recursive: true });

  for (const item of structure.items) {
    if ("folderName" in item) {
      await createStructureFromTemplate(item, dirPath);
    } else {
      const filePath = path.join(dirPath, item.filename);
      await fs.promises.writeFile(filePath, item.content, "utf8");
    }
  }

  console.log(`📁 Structure created successfully at: ${dirPath}`);
}
