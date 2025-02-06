import { FileExtension, FileType } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FileData {
  fileName: string;
  fileExtension: FileExtension;
  fileSize: number;
  fileType: FileType;
}

export function getFileData(file: File): FileData {
  // Get file name and extension
  const fileName = file.name;
  const fileExtension = fileName.split(".").pop()?.toLowerCase() as FileExtension;

  if (!fileExtension) {
    throw new Error("File must have an extension");
  }

  // File size in MB to 4 decimal places
  const fileSize = Number((file.size / 1024 / 1024).toFixed(4));

  let fileType: FileType;

  if (["png", "jpeg", "jpg"].includes(fileExtension)) {
    fileType = FileType.IMAGE;
  } else if (["pdf"].includes(fileExtension)) {
    fileType = FileType.DOCUMENT;
  } else {
    throw new Error("File extension not supported");
  }

  return {
    fileName,
    fileExtension,
    fileSize,
    fileType,
  };
}

export function formatNumber(number: number | undefined) {
  if (!number) return "-";
  return number.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}
