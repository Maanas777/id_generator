import { IdCard } from "lucide-react";

export default function ScannerHeader() {
  return (
    <div className="w-full max-w-md bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg px-6 py-4 mb-8 flex items-center gap-3">
      <IdCard size={24} className="text-indigo-400" />
      <h1 className="text-xl md:text-2xl font-semibold text-white tracking-wide">
        Scan Your ID Card
      </h1>
    </div>
  );
}
