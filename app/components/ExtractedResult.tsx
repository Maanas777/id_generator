import { Copy, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface ExtractedResultProps {
  idText: string;
  onReset: () => void;
}

export default function ExtractedResult({ idText, onReset }: ExtractedResultProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(idText);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy.");
    }
  };

  return (
    <div className="mt-6 bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10 shadow">
      <div className="text-lg font-mono text-green-400">{idText}</div>

      <div className="mt-4 flex gap-4">
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
        >
          <Copy size={18} />
          Copy
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md"
        >
          <RefreshCcw size={18} />
          Scan Another ID
        </button>
      </div>
    </div>
  );
}
