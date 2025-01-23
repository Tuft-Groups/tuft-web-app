import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { ImageIcon, FileIcon, Pencil, X } from "lucide-react";
import { useAppStore } from "@/store";

interface FileWithPreview {
  file: File;
  id: string;
  name: string;
  extension: string;
}

export default function NewFeedDialog({ open, setIsDialogOpen }: { open: boolean; setIsDialogOpen: any }) {
  const [newPost, setNewPost] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const createRoomFeedData = useAppStore((state) => state.createRoomFeedData);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map((file) => ({
      file,
      id: crypto.randomUUID(),
      name: file.name,
      extension: file.name.split(".").pop() || "",
    }));
    setSelectedFiles([...selectedFiles, ...newFiles]);
  };

  const handleRename = (id: string, newName: string) => {
    setSelectedFiles(selectedFiles.map((file) => (file.id === id ? { ...file, name: newName } : file)));
    setEditingFileId(null);
  };

  const handleDelete = (id: string) => {
    setSelectedFiles(selectedFiles.filter((file) => file.id !== id));
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingFileId(id);
    setEditingName(currentName);
  };

  return (
    <Dialog open={open} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea placeholder="Post" value={newPost} onChange={(e) => setNewPost(e.target.value)} />

          <div className="flex items-center gap-2">
            <Input type="file" onChange={handleFileSelect} className="hidden" id="file-upload" accept="image/*,.pdf" multiple />
            <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
              Attach Files
            </Button>
          </div>

          {selectedFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {selectedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-2 p-2 border rounded">
                  {file.file.type.startsWith("image/") ? <ImageIcon className="w-5 h-5" /> : <FileIcon className="w-5 h-5" />}

                  {editingFileId === file.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleRename(file.id, editingName)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRename(file.id, editingName);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 truncate">{file.name}</span>
                  )}

                  <Button variant="ghost" size="icon" onClick={() => startEditing(file.id, file.name)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(file.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await createRoomFeedData({ files: selectedFiles, message: newPost });
              setLoading(false);
              setSelectedFiles([]);
              setNewPost("");
              setIsDialogOpen(false);
            }}
            className="ml-2"
          >
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
