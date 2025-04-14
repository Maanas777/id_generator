import { useRef, useState } from "react";
import Tesseract from "tesseract.js";
import {
  Camera,
  ImagePlus,
  Copy,
  RefreshCcw,
  Loader2,
  XCircle,
  CheckCircle,
  IdCard,
} from "lucide-react";
import { Toaster, toast } from "sonner";

export default function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [idText, setIdText] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [loading, setLoading] = useState(false);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
  
      // Custom video constraints
      const videoConstraints: any = {
        facingMode: { exact: "environment" },
        advanced: [
          {
            focusMode: "continuous", // Will work if supported by browser + device
          },
        ],
      };
  
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });
  
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Back camera access failed. Please allow camera permissions.");
      setIsCapturing(false);
    }
  };
  
  

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    setIsCapturing(false);
  };

  const captureAndExtract = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    canvas.width = vw;
    canvas.height = vh;

    // Define your crop box (centered rectangle)
    const boxWidth = vw * 0.8;
    const boxHeight = vh * 0.25;
    const sx = (vw - boxWidth) / 2;
    const sy = (vh - boxHeight) / 2;

    if (ctx) {
      ctx.drawImage(
        video,
        sx,
        sy,
        boxWidth,
        boxHeight,
        0,
        0,
        boxWidth,
        boxHeight
      );
      const croppedImage = canvas.toDataURL("image/png");
      await performOCR(croppedImage);
    }

    stopCamera();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === "string") {
          await performOCR(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const performOCR = async (imageDataUrl: string) => {
    setLoading(true);
    const img = new Image();
    img.src = imageDataUrl;

    img.onload = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.filter = "brightness(100%) contrast(400%) grayscale(200%)";
        ctx.drawImage(img, 0, 0);
        const filteredImageData = canvas.toDataURL("image/png");

        const { data } = await Tesseract.recognize(filteredImageData, "eng", {
          config: {
            tessedit_char_whitelist: "0123456789",
          },
        } as any);

        const text = data.text;
        const match = text.match(/\b(?:\d{4}\s?){3}\b/);
        const cleanedId = match ? match[0].replace(/\s/g, "") : "No ID found";
        setIdText(cleanedId);
        setLoading(false);
      }
    };
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6 flex flex-col items-center ${
        !isCapturing && !idText ? "justify-center" : "justify-start"
      } text-white font-sans`}
    >
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            marginBottom: "2rem",
            fontSize: "0.95rem",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
          },
        }}
      />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg px-6 py-4 mb-8 flex items-center gap-3">
        <IdCard size={24} className="text-indigo-400" />
        <h1 className="text-xl md:text-2xl font-semibold text-white tracking-wide">
          Scan Your ID Card
        </h1>
      </div>

      {!isCapturing && !idText && (
        <div className="w-full max-w-md bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 shadow-lg flex flex-col gap-3 items-center justify-center">
          <button
            onClick={startCamera}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white h-14 w-full rounded-xl font-medium text-base shadow-md transition-transform hover:scale-105"
          >
            <Camera size={20} /> Use Camera
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white h-14 w-full rounded-xl font-medium text-base shadow-md transition-transform hover:scale-105"
          >
            <ImagePlus size={20} /> Upload from Gallery
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

{isCapturing && (
  <div className="w-full max-w-md flex flex-col items-center gap-6 mt-6 p-4  rounded-2xl shadow-xl border border-zinc-700">
    
   
    <div className="relative w-full rounded-2xl overflow-hidden">
      <video
        ref={videoRef}
        className="w-full max-h-[400px] object-cover rounded-2xl border border-zinc-700"
      />
      
  
      <div className="absolute inset-0 pointer-events-none">
      
        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl" />
      
        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl" />
        
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl" />
       
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl" />
      </div>
    </div>

    {/* Action Buttons */}
    <div className="w-full flex flex-col gap-3">
      <button
        onClick={captureAndExtract}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow"
      >
        <CheckCircle size={18} /> Capture & Extract
      </button>

      <button
        onClick={stopCamera}
        className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow"
      >
        <XCircle size={18} /> Cancel
      </button>
    </div>
  </div>
)}


      <canvas ref={canvasRef} className="hidden" />

      {loading && (
        <div className="mt-8 flex items-center gap-2 text-base font-medium text-gray-400 animate-pulse">
          <Loader2 className="animate-spin" /> Extracting ID number...
        </div>
      )}

      {!loading && idText && (
        <div className="mt-10 w-full max-w-md bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 shadow-lg flex flex-col items-center gap-4 transition-all">
          <h2 className="text-lg font-semibold text-white">Extracted ID</h2>
          <div className="flex items-center gap-2">
            <p className="text-xl font-mono text-lime-400 break-words">
              {idText}
            </p>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(idText);
                toast.success("ID copied to clipboard!");
              }}
              className="text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md text-sm transition"
            >
              <Copy size={16} />
            </button>
          </div>

          <button
            onClick={() => setIdText("")}
            className="flex items-center gap-2 mt-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl font-medium text-base shadow transition hover:scale-105"
          >
            <RefreshCcw size={18} /> Scan Another ID
          </button>
        </div>
      )}
    </div>
  );
}
