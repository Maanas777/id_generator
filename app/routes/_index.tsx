import { useRef, useState } from "react";
import Tesseract from "tesseract.js";
import { Loader2 } from "lucide-react"; 

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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" } // Force back cam on mobile
        },
        audio: false
      });
  
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Could not access back camera. Make sure permissions are allowed.", err);
      alert("Back camera access failed. Please allow camera permissions and try again.");
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
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/png");
        await performOCR(imageDataUrl);
      }
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
        ctx.filter = "brightness(100%) contrast(200%) grayscale(200%)";
        ctx.drawImage(img, 0, 0);
        const filteredImageData = canvas.toDataURL("image/png");

        const { data } = await Tesseract.recognize(filteredImageData, "eng", {
          config: {
            tessedit_char_whitelist: "0123456789",
          },
        } as any);

        console.log(data,"this is data")

        const text = data.text;
        console.log(text)
        const match = text.match(/\b(?:\d{4}\s?){3}\b/);
        const cleanedId = match ? match[0].replace(/\s/g, "") : "No ID found";
        setIdText(cleanedId);
        setLoading(false);
      }
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6 flex flex-col items-center justify-start text-white font-sans">
      <h1 className="text-4xl font-bold text-center text-white mb-8 tracking-wide drop-shadow-lg">
        📷 Scan Your ID Card
      </h1>
  
      {!isCapturing && !idText && (
        <div className="w-full max-w-md flex flex-col gap-5">
          <button
            onClick={startCamera}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 hover:scale-105"
          >
            📷 Use Camera
          </button>
  
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white py-3 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 hover:scale-105"
          >
            📁 Upload from Gallery
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
        <div className="w-full max-w-md flex flex-col items-center gap-4 mt-6">
          <video
            ref={videoRef}
            className="rounded-3xl border border-gray-700 shadow-lg w-full max-h-[400px] object-cover"
          />
          <button
            onClick={captureAndExtract}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 hover:scale-105"
          >
            ✅ Capture & Extract
          </button>
          <button
            onClick={stopCamera}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 hover:scale-105"
          >
            ❌ Cancel
          </button>
        </div>
      )}
  
      <canvas ref={canvasRef} className="hidden" />
  
      {loading && (
        <div className="mt-8 flex items-center gap-2 text-lg font-medium text-gray-300 animate-pulse">
          <Loader2 className="animate-spin" />
          Extracting ID number...
        </div>
      )}
  
      {!loading && idText && (
        <div className="mt-10 w-full max-w-md bg-white/5 backdrop-blur-lg p-6 rounded-3xl border border-white/20 shadow-xl flex flex-col items-center gap-4 transition-all duration-200">
          <h2 className="text-xl font-semibold text-white">🆔 Extracted ID</h2>
          <p className="text-2xl font-mono text-lime-400 break-words">{idText}</p>
  
          <button
            onClick={() => {
              setIdText("");
            }}
            className="mt-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-5 py-3 rounded-2xl font-semibold text-lg shadow-md transition-all hover:scale-105"
          >
            🔄 Scan Another ID
          </button>
        </div>
      )}
    </div>
  );
  
  
}
