import { create } from "zustand";
import { toast } from "sonner";
import { TemplateFile, TemplateFolder } from "../lib/path-to-json";

// ✅ Utility to generate unique file ID
function generateFileId(file: TemplateFile, root: TemplateFolder): string {
  return `${root.folderName}/${file.filename}.${file.fileExtension}`;
}

interface OpenFile extends TemplateFile {
  id: string;
  hasUnsavedChanges: boolean;
  content: string;
  originalContent: string;
}

interface FileExplorerState {
  playgroundId: string;
  templateData: TemplateFolder | null;
  openFiles: OpenFile[];
  activeFileId: string | null;
  editorContent: string;

  // ✅ Setters
  setPlaygroundId: (id: string) => void;
  setTemplateData: (data: TemplateFolder | null) => void;
  setEditorContent: (content: string) => void;
  setOpenFiles: (files: OpenFile[]) => void;
  setActiveFileId: (fileId: string | null) => void;

  // ✅ Core actions
  openFile: (file: TemplateFile) => void;
  closeFile: (fileId: string) => void;
  closeAllFiles: () => void;

  // ✅ Additional handlers (used in MainPlaygroundPage)
  handleAddFile: (folderId?: string) => void;
  handleAddFolder: (parentFolderId?: string) => void;
  handleDeleteFile: (fileId: string) => void;
  handleDeleteFolder: (folderId: string) => void;
  handleRenameFile: (fileId: string, newName: string) => void;
  handleRenameFolder: (folderId: string, newName: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
}

// ✅ Zustand store
export const useFileExplorer = create<FileExplorerState>((set, get) => ({
  playgroundId: "",
  templateData: null,
  openFiles: [],
  activeFileId: null,
  editorContent: "",

  // ✅ Setters
  setPlaygroundId: (id) => set({ playgroundId: id }),
  setTemplateData: (data) => set({ templateData: data }),
  setEditorContent: (content) => set({ editorContent: content }),
  setOpenFiles: (files) => set({ openFiles: files }),
  setActiveFileId: (fileId) => set({ activeFileId: fileId }),

  // ✅ Open file
  openFile: (file) => {
    const root = get().templateData;
    if (!root) {
      toast.error("Template data not loaded");
      return;
    }

    const fileId = generateFileId(file, root);
    const { openFiles } = get();
    const existingFile = openFiles.find((f) => f.id === fileId);

    if (existingFile) {
      set({ activeFileId: fileId, editorContent: existingFile.content });
      return;
    }

    const newOpenFile: OpenFile = {
      ...file,
      id: fileId,
      hasUnsavedChanges: false,
      content: file.content || "",
      originalContent: file.content || "",
    };

    set((state) => ({
      openFiles: [...state.openFiles, newOpenFile],
      activeFileId: fileId,
      editorContent: file.content || "",
    }));
  },

  // ✅ Close single file
  closeFile: (fileId) => {
    const { openFiles, activeFileId } = get();
    const newFiles = openFiles.filter((f) => f.id !== fileId);

    let newActiveFileId = activeFileId;
    let newEditorContent = get().editorContent;

    if (activeFileId === fileId) {
      if (newFiles.length > 0) {
        const lastFile = newFiles[newFiles.length - 1];
        newActiveFileId = lastFile.id;
        newEditorContent = lastFile.content;
      } else {
        newActiveFileId = null;
        newEditorContent = "";
      }
    }

    set({
      openFiles: newFiles,
      activeFileId: newActiveFileId,
      editorContent: newEditorContent,
    });
  },

  // ✅ Close all files
  closeAllFiles: () => {
    set({ openFiles: [], activeFileId: null, editorContent: "" });
  },

  // ✅ Placeholder implementations to fix errors
  handleAddFile: () => toast.info("Add File feature coming soon"),
  handleAddFolder: () => toast.info("Add Folder feature coming soon"),
  handleDeleteFile: () => toast.info("Delete File feature coming soon"),
  handleDeleteFolder: () => toast.info("Delete Folder feature coming soon"),
  handleRenameFile: () => toast.info("Rename File feature coming soon"),
  handleRenameFolder: () => toast.info("Rename Folder feature coming soon"),

  // ✅ Update file content in open files
  updateFileContent: (fileId, content) => {
    set((state) => ({
      openFiles: state.openFiles.map((f) =>
        f.id === fileId
          ? { ...f, content, hasUnsavedChanges: f.originalContent !== content }
          : f
      ),
      editorContent:
        state.activeFileId === fileId ? content : state.editorContent,
    }));
  },
}));
