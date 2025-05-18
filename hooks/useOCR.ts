import { useState } from "react";
import Tesseract from "tesseract.js";

export function useOCR(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [idText, setIdText] = useState("");
  const [loading, setLoading] = useState(false);

  const performOCR = async (imageDataUrl: string) => {
    setLoading(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageDataUrl;

    img.onload = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const scale = 2;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      // Binarize image (black & white)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const bin = avg > 150 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = bin;
      }
      ctx.putImageData(imageData, 0, 0);

      const processedImageDataURL = canvas.toDataURL("image/png");

      try {
        const { data } = await Tesseract.recognize(processedImageDataURL, "eng", {
          logger: (m: any) => console.log(m),
          tessedit_char_whitelist: "0123456789",
        } as any);

        console.log("Raw OCR Output:", data.text);

        // Match exactly 12-digit numbers
        const match = data.text.match(/\b\d{12}\b/);
        const id = match ? match[0] : "No ID found";

        setIdText(id);
      } catch (err) {
        console.error("OCR error:", err);
        setIdText("Error during OCR");
      }

      setLoading(false);
    };
  };

  return { idText, loading, performOCR, setIdText };
}
