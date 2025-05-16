import { ImagePlus, Camera } from "lucide-react";

interface UploadButtonsProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  startCamera: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UploadButtons({
  fileInputRef,
  startCamera,
  onFileChange,
}: UploadButtonsProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
      >
        <ImagePlus size={18} />
        Upload from Gallery
      </button>

      <button
        onClick={startCamera}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow"
      >
        <Camera size={18} />
        Use Camera
      </button>

      {/* hidden input field to trigger gallery upload */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  );
}
