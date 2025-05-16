import { Loader2 } from "lucide-react";

export default function LoadingIndicator() {
  return (
    <div className="mt-8 flex items-center gap-2 text-base font-medium text-gray-400 animate-pulse">
      <Loader2 className="animate-spin" /> Extracting ID number...
    </div>
  );
}
