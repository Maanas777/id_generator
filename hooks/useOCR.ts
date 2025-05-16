import { useState } from "react";
import Tesseract from "tesseract.js";

export function useOCR(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [idText, setIdText] = useState("");
  const [loading, setLoading] = useState(false);

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
          config: { tessedit_char_whitelist: "0123456789" }
        } as any);

        const match = data.text.match(/\b(?:\d{4}\s?){3}\b/);
        const cleanedId = match ? match[0].replace(/\s/g, "") : "No ID found";
        setIdText(cleanedId);
        setLoading(false);
      }
    };
  };

  return { idText, loading, performOCR, setIdText };
}
