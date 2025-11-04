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

interface RenameFolderDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onRenameFolder: (newFolderName: string) => void;
  currentFolderName: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function RenameFolderDialog({
  isOpen,
  setIsOpen,
  onRenameFolder,
  currentFolderName,
  title = "Rename Folder",
  description = "Enter a new name for the selected folder.",
  confirmLabel = "Rename",
  cancelLabel = "Cancel",
}: RenameFolderDialogProps) {
  const [newFolderName, setNewFolderName] = React.useState(currentFolderName);

  React.useEffect(() => {
    setNewFolderName(currentFolderName);
  }, [currentFolderName, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onRenameFolder(newFolderName.trim());
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setNewFolderName(currentFolderName);
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
            <Label htmlFor="newFolderName">New Folder Name</Label>
            <Input
              id="newFolderName"
              placeholder="Enter new folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
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
