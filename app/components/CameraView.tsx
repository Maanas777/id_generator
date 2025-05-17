import { CheckCircle, XCircle } from "lucide-react";

export default function CameraView({
  videoRef,
  captureAndExtract,
  stopCamera,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  captureAndExtract: () => void;
  stopCamera: () => void;
}) {
  return (
    <div className="w-full max-w-md mt-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-xl overflow-hidden">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-[400px] object-cover rounded-t-3xl"
          autoPlay
          playsInline
        />

        {/* Scan Border Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-3 px-4 py-5 bg-gray-950/60">
        <button
          onClick={captureAndExtract}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-200 hover:scale-105"
        >
          <CheckCircle size={20} />
          Capture & Extract
        </button>

        <button
          onClick={stopCamera}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all duration-200 hover:scale-105"
        >
          <XCircle size={20} />
          Cancel
        </button>
      </div>
    </div>
  );
}
