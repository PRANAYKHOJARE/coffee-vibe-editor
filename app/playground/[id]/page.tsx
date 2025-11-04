"use client";

import React from "react";
import { useParams } from "next/navigation";
import { usePlayground } from "@/modules/playground/hooks/usePlayground";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

// ✅ Correct import name (ensure this file exports TemplateFileTree)
import { TemplateFileTree } from "@/modules/playground/components/playground-explorer";

const MainPlaygroundPage = () => {
  const { id } = useParams<{ id: string }>();
  const { playgroundData, templateData, isLoading, error, saveTemplateData } =
    usePlayground(id);

  console.log("templateData", templateData);
  console.log("playgroundData", playgroundData);

  const activeFile = "sample.txt";

  return (
    <TooltipProvider>
      <>
        {/* ✅ Fix 1: render only when templateData is available */}
        {templateData && (
          <TemplateFileTree
            data={templateData!} // ✅ now safe (not null)
            onFileSelect={() => {}}
            selectedFile={activeFile}
            title="File Explorer"
            onAddFile={() => {}}
            onAddFolder={() => {}}
            onDeleteFile={() => {}}
            onDeleteFolder={() => {}}
            onRenameFile={() => {}}
            onRenameFolder={() => {}}
          />
        )}

        {/* ✅ Fix 2: prevent crash during loading */}
        {isLoading && (
          <p className="text-sm text-muted-foreground px-4">
            Loading file tree...
          </p>
        )}

        {/* ✅ layout */}
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
