"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TemplateFileTree } from "@/modules/playground/components/playground-explorer";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { usePlayground } from "@/modules/playground/hooks/usePlayground";
import { findFilePath } from "@/modules/playground/lib";
import {
  TemplateFile,
  TemplateFolder,
} from "@/modules/playground/lib/path-to-json";
import {
  AlertCircle,
  FileText,
  FolderOpen,
  Save,
  Settings,
  X,
  Bot,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";
import WebContainerPreview from "@/modules/webcontainers/components/webcontainer-preview";
import { useWebContainer } from "@/modules/webcontainers/hooks/useWebCointer";


const MainPlaygroundPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
 
  const { playgroundData, templateData, isLoading, error, saveTemplateData } =
    usePlayground(id);

     const {
       serverUrl,
       isLoading: containerLoading,
       error: containerError,
       instance,
       writeFileSync,
       // @ts-ignore
     } = useWebContainer({ templateData });



  const {
    setTemplateData,
    setActiveFileId,
    setPlaygroundId,
    setOpenFiles,
    activeFileId,
    closeAllFiles,
    closeFile,
    openFile,
    openFiles,
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
    updateFileContent,
  } = useFileExplorer();

  const lastSyncedContent = useRef<Map<string, string>>(new Map());

  // ✅ Setup Playground ID
  useEffect(() => {
    setPlaygroundId(id);
  }, [id, setPlaygroundId]);

  // ✅ Sync fetched data
  useEffect(() => {
    if (templateData && !openFiles.length) {
      setTemplateData(templateData);
    }
  }, [templateData, setTemplateData, openFiles.length]);

  // ✅ Handle file open from sidebar
  const handleFileSelect = (file: TemplateFile) => {
    if (!file) return;
    openFile(file);
    setActiveFileId(file.id);
  };

  // ✅ Save single file
  const handleSave = useCallback(
    async (fileId?: string) => {
      const targetFileId = fileId || activeFileId;
      if (!targetFileId) return;

      const fileToSave = openFiles.find((f) => f.id === targetFileId);
      if (!fileToSave) return;

      const latestTemplateData = useFileExplorer.getState().templateData;
      if (!latestTemplateData) return;

      try {
        const filePath = findFilePath(fileToSave, latestTemplateData);
        if (!filePath) {
          toast.error(
            `Could not find path for ${fileToSave.filename}.${fileToSave.fileExtension}`
          );
          return;
        }

        const updatedTemplateData = JSON.parse(
          JSON.stringify(latestTemplateData)
        );

        const updateFileContentRec = (
          items: any[]
        ): (TemplateFile | TemplateFolder)[] => {
          return items.map((item) => {
            if ("folderName" in item) {
              return {
                ...item,
                items: updateFileContentRec(item.items),
              } as TemplateFolder;
            } else {
              return {
                ...item,
                content:
                  item.filename === fileToSave.filename &&
                  item.fileExtension === fileToSave.fileExtension
                    ? fileToSave.content
                    : item.content,
              } as TemplateFile;
            }
          });
        };

        updatedTemplateData.items = updateFileContentRec(
          updatedTemplateData.items
        );

        await saveTemplateData(updatedTemplateData);
        setTemplateData(updatedTemplateData);

        const updatedOpenFiles = openFiles.map((f) =>
          f.id === targetFileId
            ? {
                ...f,
                content: fileToSave.content,
                originalContent: fileToSave.content,
                hasUnsavedChanges: false,
              }
            : f
        );
        setOpenFiles(updatedOpenFiles);

        toast.success(
          `Saved ${fileToSave.filename}.${fileToSave.fileExtension}`
        );
      } catch (err) {
        console.error("Error saving file:", err);
        toast.error("Failed to save file");
      }
    },
    [activeFileId, openFiles, saveTemplateData, setTemplateData, setOpenFiles]
  );

  // ✅ Save all files
  const handleSaveAll = async () => {
    const unsaved = openFiles.filter((f) => f.hasUnsavedChanges);
    if (unsaved.length === 0) {
      toast.info("No unsaved changes");
      return;
    }
    try {
      await Promise.all(unsaved.map((f) => handleSave(f.id)));
      toast.success(`Saved ${unsaved.length} file(s)`);
    } catch {
      toast.error("Failed to save some files");
    }
  };

  // ✅ Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveAll();
      } else if (e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        toast.message("🤖 AI Bot is thinking...");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleSaveAll]);

  const activeFile = openFiles.find((f) => f.id === activeFileId);
  const hasUnsavedChanges = openFiles.some((f) => f.hasUnsavedChanges);

  // ✅ States
  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-red-600 mt-2">{error}</p>
        <Button variant="destructive" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    );

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-gray-500">
        <p className="animate-pulse">Loading Playground...</p>
      </div>
    );

  if (!templateData)
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-gray-600">
        <FolderOpen className="h-10 w-10 text-amber-500 mb-2" />
        <p>No template data available</p>
      </div>
    );

  return (
    <TooltipProvider>
      <TemplateFileTree
        data={templateData}
        onFileSelect={handleFileSelect}
        selectedFile={activeFile}
        title="File Explorer"
        onAddFile={(file, parentPath) => handleAddFile?.(parentPath)}
        onAddFolder={(folder, parentPath) => handleAddFolder?.(parentPath)}
        onDeleteFile={(file, parentPath) => handleDeleteFile?.(file.id)}
        onDeleteFolder={(folder, parentPath) =>
          handleDeleteFolder?.(folder.folderName)
        }
        onRenameFile={(file, newFilename, newExtension, parentPath) =>
          handleRenameFile?.(file.id, newFilename)
        }
        onRenameFolder={(folder, newFolderName, parentPath) =>
          handleRenameFolder?.(folder.folderName, newFolderName)
        }
      />

      <SidebarInset>
        {/* ===== Header ===== */}

        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          <div className="flex flex-1 items-center gap-2">
            <div className="flex flex-col flex-1">
              <h1 className="text-sm font-medium">
                {playgroundData?.title || "Code Playground"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {openFiles.length} file(s) open
                {hasUnsavedChanges && " • Unsaved changes"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* 💾 Save Button with Tooltip */}
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSave()}
                      disabled={!activeFile || !activeFile.hasUnsavedChanges}
                      className="transition-colors hover:bg-green-100 hover:border-green-600 hover:text-green-700"
                    >
                      <Save className="h-4 w-4 text-green-600 group-hover:text-green-700 transition-colors" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="center"
                    className="z-50 bg-gray-900 text-white text-xs rounded-md shadow-md px-2 py-1 border border-gray-700"
                  >
                    💾 Save <span className="opacity-70">(Ctrl + S)</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* 💾 Save All Button with Tooltip */}
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveAll}
                      disabled={!hasUnsavedChanges}
                      className="transition-colors hover:bg-blue-100 hover:border-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Save className="h-4 w-4 text-blue-600 group-hover:text-blue-700 transition-colors" />{" "}
                      All
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="center"
                    className="z-50 bg-gray-900 text-white text-xs rounded-md shadow-md px-2 py-1 border border-gray-700"
                  >
                    💾 Save All{" "}
                    <span className="opacity-70">(Ctrl + Shift + S)</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* 🤖 AI Bot Button */}
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.message("🤖 AI Bot is thinking...")}
                    className="hover:bg-purple-50 transition-colors"
                  >
                    <Bot className="h-4 w-4 text-purple-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="center"
                  className="bg-gray-900 text-white text-xs rounded-md shadow-md px-2 py-1"
                >
                  Ask AI (Alt + A)
                </TooltipContent>
              </Tooltip>

              {/* ⚙️ Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                  >
                    {isPreviewVisible ? "Hide" : "Show"} Preview
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={closeAllFiles}>
                    Close All Files
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* ===== Editor + Preview (Resizable) ===== */}
        <div className="h-[calc(100vh-4rem)]">
          {openFiles.length > 0 ? (
            <ResizablePanelGroup
              direction="horizontal"
              className="h-full border-t"
            >
              {/* 📝 Editor Panel */}
              <ResizablePanel defaultSize={isPreviewVisible ? 60 : 100}>
                <div className="h-full flex flex-col">
                  <div className="border-b bg-muted/30">
                    <Tabs
                      value={activeFileId || ""}
                      onValueChange={(val) => setActiveFileId(val)}
                    >
                      <div className="flex items-center justify-between px-4 py-2">
                        <TabsList className="h-8 bg-transparent p-0">
                          {openFiles.map((file) => (
                            <TabsTrigger
                              key={file.id}
                              value={file.id}
                              className="relative h-8 px-3 group"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                <span>
                                  {file.filename}.{file.fileExtension}
                                </span>
                                {file.hasUnsavedChanges && (
                                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                                )}
                                <span
                                  className="ml-2 h-4 w-4 hover:bg-destructive hover:text-destructive-foreground rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    closeFile(file.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </span>
                              </div>
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {openFiles.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={closeAllFiles}
                            className="h-6 px-2 text-xs"
                          >
                            Close All
                          </Button>
                        )}
                      </div>
                    </Tabs>
                  </div>

                  {/* ✅ Monaco Editor */}
                  <div className="flex-1 bg-gray-900 text-white overflow-hidden">
                    {activeFile ? (
                      <Editor
                        height="100%"
                        theme="vs-dark"
                        language={
                          activeFile.fileExtension === "js"
                            ? "javascript"
                            : activeFile.fileExtension === "ts"
                            ? "typescript"
                            : activeFile.fileExtension === "tsx"
                            ? "typescript"
                            : activeFile.fileExtension === "jsx"
                            ? "javascript"
                            : activeFile.fileExtension === "html"
                            ? "html"
                            : activeFile.fileExtension === "css"
                            ? "css"
                            : activeFile.fileExtension === "json"
                            ? "json"
                            : "plaintext"
                        }
                        value={activeFile.content || ""}
                        onChange={(value) =>
                          updateFileContent(activeFile.id, value || "")
                        }
                        options={{
                          fontSize: 14,
                          minimap: { enabled: false },
                          automaticLayout: true,
                          scrollBeyondLastLine: false,
                          smoothScrolling: true,
                          wordWrap: "on",
                          roundedSelection: true,
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        Select a file from the sidebar to start editing
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>

              {/* 🔸 Preview Panel (toggleable) */}
              {isPreviewVisible && (
                <>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={50}>
                    <WebContainerPreview
                      templateData={templateData}
                      instance={instance}
                      writeFileSync={writeFileSync}
                      isLoading={containerLoading}
                      error={containerError}
                      serverUrl={serverUrl!}
                      forceResetup={false}
                    />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          ) : (
            <div className="flex flex-col h-full items-center justify-center text-muted-foreground gap-4">
              <FileText className="h-16 w-16 text-gray-300" />
              <div className="text-center">
                <p className="text-lg font-medium">No files open</p>
                <p className="text-sm text-gray-500">
                  Select a file from the sidebar to start editing
                </p>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </TooltipProvider>
  );
};

export default MainPlaygroundPage;
