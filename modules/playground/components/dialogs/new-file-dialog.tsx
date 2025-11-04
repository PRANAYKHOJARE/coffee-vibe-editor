"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NewFileDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCreateFile: (filename: string, extension: string) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function NewFileDialog({
  isOpen,
  setIsOpen,
  onCreateFile,
  title = "Create New File",
  description = "Enter the filename and extension to create a new file in your project.",
  confirmLabel = "Create",
  cancelLabel = "Cancel",
}: NewFileDialogProps) {
  const [filename, setFilename] = React.useState("");
  const [extension, setExtension] = React.useState("js");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filename.trim()) {
      onCreateFile(filename.trim(), extension.trim() || "js");
      setFilename("");
      setExtension("js");
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setFilename("");
    setExtension("js");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              placeholder="Enter file name"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="extension">Extension</Label>
            <Input
              id="extension"
              placeholder="e.g. js, ts, html"
              value={extension}
              onChange={(e) => setExtension(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {cancelLabel}
            </Button>
            <Button type="submit">{confirmLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
