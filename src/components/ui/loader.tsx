import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function Loader({ loading, className }: { loading: boolean; className?: string }) {
  if (!loading) return <></>;
  return <Loader2 className={cn("animate-spin", className)} />;
}
