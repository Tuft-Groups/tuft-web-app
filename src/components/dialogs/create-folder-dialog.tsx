import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFolder: (folderName: string, folderDescription: string) => Promise<void>;
}

export function CreateFolderDialog({ open, onOpenChange, onCreateFolder }: CreateFolderDialogProps) {
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      setLoading(true);
      await onCreateFolder(newFolderName.trim(), newFolderDescription.trim());
      setLoading(false);
      setNewFolderName("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <Input
          type="text"
          placeholder="Name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCreateFolder();
            }
          }}
          className="mt-2"
        />
        <Input
          placeholder="Description (optional)"
          value={newFolderDescription}
          onChange={(e) => setNewFolderDescription(e.target.value)}
          className="mt-2"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateFolder} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
