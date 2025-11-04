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

interface RenameFileDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onRenameFile: (newFilename: string, newExtension: string) => void; // ✅ accepts two args
  currentFilename: string;
  currentExtension: string; // ✅ added for proper rename
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function RenameFileDialog({
  isOpen,
  setIsOpen,
  onRenameFile,
  currentFilename,
  currentExtension,
  title = "Rename File",
  description = "Enter a new name and extension for the selected file.",
  confirmLabel = "Rename",
  cancelLabel = "Cancel",
}: RenameFileDialogProps) {
  const [newFilename, setNewFilename] = React.useState(currentFilename);
  const [newExtension, setNewExtension] = React.useState(currentExtension);

  // Reset fields when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setNewFilename(currentFilename);
      setNewExtension(currentExtension);
    }
  }, [currentFilename, currentExtension, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFilename.trim()) {
      onRenameFile(newFilename.trim(), newExtension.trim() || currentExtension); // ✅ fixed: pass both args
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setNewFilename(currentFilename);
    setNewExtension(currentExtension);
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
            <Label htmlFor="newFilename">New Filename</Label>
            <Input
              id="newFilename"
              placeholder="Enter new filename"
              value={newFilename}
              onChange={(e) => setNewFilename(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="newExtension">Extension</Label>
            <Input
              id="newExtension"
              placeholder="e.g. js, ts, html"
              value={newExtension}
              onChange={(e) => setNewExtension(e.target.value)}
              required
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
