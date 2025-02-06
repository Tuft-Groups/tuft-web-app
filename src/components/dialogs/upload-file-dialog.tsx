import { useState } from "react";
import { Button } from "../ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { X, Pencil, FileText, Loader2 } from "lucide-react";
import { API_URLS } from "@/constants/api_urls";
import makeApiCall from "@/lib/api_wrapper";
import { nanoid } from "nanoid";
import { useAppStore } from "@/store";
import { FileExtension } from "@prisma/client";
import { FileType } from "@prisma/client";
import Loader from "../ui/loader";

interface FileWithId {
  id: string;
  file: File;
  editedName: string;
  isEditing: boolean;
  uploadProgress: number;
  isUploading: boolean;
  size: number;
}

interface UploadFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadFiles: (files: FileWithId[]) => void;
  parentId: string | null;
}

const ACCEPTED_FILE_TYPES = "application/pdf,image/*";

export default function UploadFileDialog({ open, onOpenChange, onUploadFiles, parentId }: UploadFileDialogProps) {
  const { createFiles } = useAppStore();
  const [selectedFiles, setSelectedFiles] = useState<FileWithId[]>([]);
  const [btnLoading, setBtnLoading] = useState(false);

  const isImageFile = (file: File) => file.type.startsWith("image/");
  const isPdfFile = (file: File) => file.type === "application/pdf";

  const FilePreview = ({ file }: { file: File }) => {
    if (isImageFile(file)) {
      return <img src={URL.createObjectURL(file)} alt="Preview" className="h-10 w-10 object-cover rounded" />;
    }
    if (isPdfFile(file)) {
      return <FileText className="h-10 w-10 text-red-500" />;
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log({ size: files[0].size });
    const filesWithIds = files.map((file) => ({
      id: nanoid(15),
      file,
      editedName: file.name,
      isEditing: false,
      uploadProgress: 0,
      isUploading: false,
      size: file.size,
    }));
    setSelectedFiles((prev) => [...prev, ...filesWithIds]);
  };

  const updateFileName = (id: string, newName: string, shouldFinishEditing: boolean = false) => {
    const file = selectedFiles.find((f) => f.id === id);
    if (!file) return;

    const originalExtension = file.file.name.split(".").pop();
    const newNameWithoutExtension = newName.split(".")[0];

    // Ensure the original extension is preserved
    const finalName = `${newNameWithoutExtension}.${originalExtension}`;

    setSelectedFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, editedName: finalName, isEditing: !shouldFinishEditing } : file))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === "Enter") {
      const input = e.currentTarget;
      updateFileName(id, input.value, true);
    }
  };

  const uploadFile = async (fileData: FileWithId) => {
    try {
      // Set uploading state
      setSelectedFiles((prev) => prev.map((f) => (f.id === fileData.id ? { ...f, isUploading: true } : f)));

      const fileExtension = fileData.file.name.split(".").pop();

      // Get signed URL
      const response = await makeApiCall({
        url: API_URLS.GET_SIGNED_URL,
        method: "GET",
        params: {
          file_path: `files/${fileData.id}.${fileExtension}`,
          //   file_path: `files/${fileData.editedName}`,
        },
      });

      // Upload to signed URL
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", response.put_url);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setSelectedFiles((prev) => prev.map((f) => (f.id === fileData.id ? { ...f, uploadProgress: progress } : f)));
        }
      };

      return new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(true);
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(fileData.file);
      });
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleUpload = async () => {
    try {
      setBtnLoading(true);
      await Promise.all(selectedFiles.map(uploadFile));
      await createFiles(
        parentId,
        selectedFiles.map((file) => ({
          id: file.id,
          file_name: file.editedName,
          file_extension: file.file.name.split(".").pop() as FileExtension,
          file_type: file.file.name.split(".").pop() === "pdf" ? FileType.DOCUMENT : FileType.IMAGE,
          file_size: Number((file.size / (1024 * 1024)).toFixed(2)), // Convert bytes to MB with 2 decimal places
        }))
      );
      setSelectedFiles([]);
      onUploadFiles(selectedFiles);
      onOpenChange(false);
      setBtnLoading(false);
    } catch (error) {
      console.error("Upload error:", error);
      // Handle error (you might want to add error state and UI feedback)
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Input
            type="file"
            multiple
            accept={ACCEPTED_FILE_TYPES}
            onChange={handleFileChange}
            className="cursor-pointer"
          />

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {selectedFiles.map((fileData) => (
              <div key={fileData.id} className="flex items-center gap-2 p-2 border rounded-md">
                <div className="flex-shrink-0">
                  <FilePreview file={fileData.file} />
                </div>

                {fileData.isUploading ? (
                  <>
                    <span className="flex-1 truncate">{fileData.editedName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{fileData.uploadProgress}%</span>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </>
                ) : (
                  <>
                    {fileData.isEditing ? (
                      <Input
                        value={fileData.editedName}
                        onChange={(e) => updateFileName(fileData.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, fileData.id)}
                        onBlur={(e) => updateFileName(fileData.id, e.target.value, true)}
                        autoFocus
                        className="flex-1"
                      />
                    ) : (
                      <span className="flex-1 truncate">{fileData.editedName}</span>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedFiles((prev) =>
                          prev.map((file) => (file.id === fileData.id ? { ...file, isEditing: !file.isEditing } : file))
                        );
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedFiles((prev) => prev.filter((file) => file.id !== fileData.id));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="default"
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || selectedFiles.some((f) => f.isUploading) || btnLoading}
            >
              {btnLoading ? <Loader loading={btnLoading} className="h-4 w-4 animate-spin" /> : "Upload Files"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
