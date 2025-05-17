import { useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { IdCard, Loader2 } from "lucide-react";
import CameraView from "../components/CameraView";
import UploadButtons from "../components/UploadOptions";
import ExtractedResult from "../components/ExtractedResult";
import { useOCR } from "../../hooks/useOCR";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const { idText, loading, performOCR, setIdText } = useOCR(canvasRef);

  const startCamera = async () => {
    try {
      setIsCapturing(true);

      const constraints = {
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          focusMode: "continuous"
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Log camera capabilities (optional)
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.();
      console.log("Camera capabilities:", capabilities);
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Unable to access the back camera. Trying fallback...");

      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
        }
      } catch (fallbackErr) {
        console.error("Fallback camera error:", fallbackErr);
        toast.error("Unable to access any camera.");
      }

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

    const boxWidth = vw * 0.8;
    const boxHeight = vh * 0.25;
    const sx = (vw - boxWidth) / 2;
    const sy = (vh - boxHeight) / 2;

    if (ctx) {
      ctx.drawImage(video, sx, sy, boxWidth, boxHeight, 0, 0, boxWidth, boxHeight);
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

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6 flex flex-col items-center ${
        !isCapturing && !idText ? "justify-center" : "justify-start"
      } text-white font-sans`}
    >
      <Toaster position="bottom-center" />
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg px-6 py-4 mb-8 flex items-center gap-3">
        <IdCard size={24} className="text-indigo-400" />
        <h1 className="text-xl md:text-2xl font-semibold text-white tracking-wide">
          Scan Your ID Card
        </h1>
      </div>

      {!isCapturing && !idText && (
        <UploadButtons
          fileInputRef={fileInputRef}
          startCamera={startCamera}
          onFileChange={handleFileChange}
        />
      )}

      {isCapturing && (
        <CameraView
          videoRef={videoRef}
          captureAndExtract={captureAndExtract}
          stopCamera={stopCamera}
        />
      )}

      <canvas ref={canvasRef} className="hidden" />

      {loading && (
        <div className="mt-8 flex items-center gap-2 text-base font-medium text-gray-400 animate-pulse">
          <Loader2 className="animate-spin" /> Extracting ID number...
        </div>
      )}

      {!loading && idText && (
        <ExtractedResult idText={idText} onReset={() => setIdText("")} />
      )}
    </div>
  );
}
