import React from "react";

type Props = {
  videoRef: React.RefObject<HTMLVideoElement>;
  captureAndExtract: () => void;
  stopCamera: () => void;
};

export default function CameraView({
  videoRef,
  captureAndExtract,
  stopCamera,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Video Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-h-[400px] object-cover rounded-2xl border border-zinc-700 shadow-lg"
      />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={captureAndExtract}
          className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors duration-200 shadow-md"
        >
          Capture & Extract
        </button>

        <button
          onClick={stopCamera}
          className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors duration-200 shadow-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
