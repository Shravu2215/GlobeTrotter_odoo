import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={cn("animate-spin text-current", className)} />;
}