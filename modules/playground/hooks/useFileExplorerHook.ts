"use client";

import { useState } from "react";
import { TemplateFile, TemplateFolder } from "../lib/path-to-json";

// ✅ Utility to generate a unique file ID
function generateFileId(
  file: TemplateFile,
  templateData: TemplateFolder
): string {
  const findPath = (
    folder: TemplateFolder,
    target: TemplateFile,
    currentPath = ""
  ): string | null => {
    for (const item of folder.items) {
      if (
        "filename" in item &&
        item.filename === target.filename &&
        item.fileExtension === target.fileExtension
      ) {
        return currentPath
          ? `${currentPath}/${item.filename}.${item.fileExtension}`
          : `${item.filename}.${item.fileExtension}`;
      }
      if ("folderName" in item) {
        const newPath = currentPath
          ? `${currentPath}/${item.folderName}`
          : item.folderName;
        const result = findPath(item, target, newPath);
        if (result) return result;
      }
    }
    return null;
  };

  const path = findPath(templateData, file);
  return path ? path : `file_${Math.random().toString(36).substr(2, 9)}`;
}

// ✅ Hook: File Explorer
export function useFileExplorer(initialData: TemplateFolder): {
  templateData: TemplateFolder;
  setTemplateData: React.Dispatch<React.SetStateAction<TemplateFolder>>;
  activeFileId: string | null;
  setActiveFileId: React.Dispatch<React.SetStateAction<string | null>>;
  openFiles: string[];
  setOpenFiles: React.Dispatch<React.SetStateAction<string[]>>;
  addFile: (folderId: string, filename: string, extension: string) => void;
  renameItem: (itemId: string, newName: string) => void;
  deleteItem: (itemId: string) => void;
  openFile: (fileId: string) => void;
  handleRenameFolder: (
    folder: TemplateFolder,
    newFolderName: string,
    parentPath: string
  ) => void;
  setPlaygroundId: React.Dispatch<React.SetStateAction<string | null>>;
  closeAllFiles: () => void;
  playgroundId: string | null;
} {
  const [templateData, setTemplateData] = useState<TemplateFolder>(initialData);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [playgroundId, setPlaygroundId] = useState<string | null>(null);

  // ✅ Add new file
  const addFile = (folderId: string, filename: string, extension: string) => {
    const newFile: TemplateFile = {
      id: `file_${Math.random().toString(36).substr(2, 9)}`,
      filename,
      fileExtension: extension,
      type: "file",
      content: "",
    };

    const addToFolder = (folder: TemplateFolder): TemplateFolder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          items: [...folder.items, newFile],
        };
      }
      return {
        ...folder,
        items: folder.items.map((item) =>
          "folderName" in item ? addToFolder(item) : item
        ),
      };
    };

    setTemplateData(addToFolder(templateData));
  };

  // ✅ Rename a file or folder
  const renameItem = (itemId: string, newName: string) => {
    const renameRecursive = (folder: TemplateFolder): TemplateFolder => {
      return {
        ...folder,
        items: folder.items.map((item) => {
          if (item.id === itemId) {
            if ("folderName" in item) return { ...item, folderName: newName };
            if ("filename" in item) return { ...item, filename: newName };
          }
          if ("folderName" in item) return renameRecursive(item);
          return item;
        }),
      };
    };

    setTemplateData(renameRecursive(templateData));
  };

  // ✅ Delete file or folder
  const deleteItem = (itemId: string) => {
    const deleteRecursive = (folder: TemplateFolder): TemplateFolder => {
      return {
        ...folder,
        items: folder.items
          .filter((item) => item.id !== itemId)
          .map((item) => ("folderName" in item ? deleteRecursive(item) : item)),
      };
    };

    setTemplateData(deleteRecursive(templateData));
  };

  // ✅ Find file by ID
  const findItemById = (items: any[], id: string): any | undefined => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.items) {
        const found = findItemById(item.items, id);
        if (found) return found;
      }
    }
  };

  // ✅ Open file handler
  const openFile = (fileId: string) => {
    const file = findItemById(templateData.items, fileId);
    if (!file || file.type !== "file") return;

    const fileUniqueId = generateFileId(file, templateData);
    if (!openFiles.includes(fileUniqueId)) {
      setOpenFiles([...openFiles, fileUniqueId]);
    }
    setActiveFileId(fileUniqueId);
  };

  // ✅ Rename folder handler
  const handleRenameFolder = (
    folder: TemplateFolder,
    newFolderName: string,
    parentPath: string
  ) => {
    const updatedData = { ...templateData };

    const renameRecursively = (items: any[]): boolean => {
      for (const item of items) {
        if (item.id === folder.id && "folderName" in item) {
          item.folderName = newFolderName;
          return true;
        }
        if (item.items && renameRecursively(item.items)) return true;
      }
      return false;
    };

    renameRecursively(updatedData.items);
    setTemplateData(updatedData);
  };

  // ✅ Close all open files
  const closeAllFiles = () => {
    setOpenFiles([]);
    setActiveFileId(null);
  };

  // ✅ Return all handlers
  return {
    templateData,
    setTemplateData,
    activeFileId,
    setActiveFileId,
    openFiles,
    setOpenFiles,
    addFile,
    renameItem,
    deleteItem,
    openFile,
    handleRenameFolder,
    setPlaygroundId,
    closeAllFiles,
    playgroundId,
  };
}
