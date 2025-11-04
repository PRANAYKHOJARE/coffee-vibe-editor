"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { usePlayground } from "@/modules/playground/hooks/usePlayground";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import { TemplateFileTree } from "@/modules/playground/components/playground-explorer";
import type {
  TemplateFile,
  TemplateFolder,
  // if you have a wrapper type exported from path-to-json like TemplateResponse, import it
} from "@/modules/playground/lib/path-to-json";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";

const parseSelectedFile = (
  fileStr: string | TemplateFile | undefined
): TemplateFile | undefined => {
  if (!fileStr) return undefined;
  if (typeof fileStr !== "string") return fileStr;
  const parts = fileStr.split(".");
  if (parts.length === 1) {
    return { filename: parts[0], fileExtension: "", content: "" };
  }
  const fileExtension = parts.pop() || "";
  const filename = parts.join(".");
  return { filename, fileExtension, content: "" };
};

const getStructureFromTemplateData = (
  maybeStructure: any
): TemplateFolder | null => {
  if (!maybeStructure) return null;

  // case A: data already is a TemplateFolder
  if (
    typeof maybeStructure === "object" &&
    "folderName" in maybeStructure &&
    "items" in maybeStructure
  ) {
    return maybeStructure as TemplateFolder;
  }

  // case B: data has a .structure property (your runtime shape)
  if (typeof maybeStructure === "object" && "structure" in maybeStructure) {
    const s = maybeStructure.structure;
    if (s && typeof s === "object" && "folderName" in s && "items" in s) {
      return s as TemplateFolder;
    }
  }

  // fallback
  return null;
};

const MainPlaygroundPage = () => {
  const { id } = useParams<{ id: string }>();
  const { playgroundData, templateData, isLoading, error, saveTemplateData } =
    usePlayground(id);

  const {
    setTemplateData,
    setActiveFileId,
    setPlaygroundId,
    setOpenFiles,
    activeFileId,
    closeAllFiles,
    openFile,
    openFiles,
  } = useFileExplorer();

  useEffect(() => {
    setPlaygroundId(id);
  }, [id, setPlaygroundId]);

  useEffect(() => {
    if (templateData && !openFiles.length) {
      setTemplateData(templateData);
    }
  }, [templateData, setTemplateData, openFiles.length]);

  // Example active file - you can wire this to state or route
  const activeFile = openFiles.find((file) => file.id === activeFileId);
  const hasUnsavedChanges = openFiles.some((file) => file.hasUnsavedChanges);

  const handleFileSelect = (file: TemplateFile) => {
    openFile(file);
  };

  // Convert activeFile (string) to TemplateFile object for the tree
  const selectedFileObj = parseSelectedFile(activeFile);

  // Resolve the actual folder structure that TemplateFileTree expects
  const folderStructure = getStructureFromTemplateData(templateData);

  return (
    <TooltipProvider>
      <>
        {/* Render only when we have the correct folder structure */}
        <TemplateFileTree
          data={templateData!}
          onFileSelect={handleFileSelect}
          selectedFile={activeFile} // now a TemplateFile | undefined
          title="File Explorer"
          onAddFile={() => {}}
          onAddFolder={() => {}}
          onDeleteFile={() => {}}
          onDeleteFolder={() => {}}
          onRenameFile={() => {}}
          onRenameFolder={() => {}}
        />

        {isLoading && (
          <p className="text-sm text-muted-foreground px-4">
            Loading file tree...
          </p>
        )}

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>

          <div className="flex flex-1 items-center gap-2">
            <div className="flex flex-col flex-1">
              <h1 className="text-sm font-medium">
                {playgroundData?.title || "Code Playground"}
              </h1>
            </div>
          </div>
        </SidebarInset>
      </>
    </TooltipProvider>
  );
};

export default MainPlaygroundPage;
