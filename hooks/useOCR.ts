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

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Step 1: Draw image to canvas
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Step 2: Convert to grayscale
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);

      // Step 3: Sharpening filter
      const sharpen = (ctx: CanvasRenderingContext2D, imageData: ImageData) => {
        const w = imageData.width;
        const h = imageData.height;
        const output = ctx.createImageData(w, h);
        const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        const side = 3;
        const halfSide = 1;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            let r = 0, g = 0, b = 0;
            for (let cy = 0; cy < side; cy++) {
              for (let cx = 0; cx < side; cx++) {
                const scy = y + cy - halfSide;
                const scx = x + cx - halfSide;
                if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                  const srcOffset = (scy * w + scx) * 4;
                  const wt = weights[cy * side + cx];
                  r += imageData.data[srcOffset] * wt;
                  g += imageData.data[srcOffset + 1] * wt;
                  b += imageData.data[srcOffset + 2] * wt;
                }
              }
            }
            const dstOffset = (y * w + x) * 4;
            output.data[dstOffset] = Math.min(Math.max(r, 0), 255);
            output.data[dstOffset + 1] = Math.min(Math.max(g, 0), 255);
            output.data[dstOffset + 2] = Math.min(Math.max(b, 0), 255);
            output.data[dstOffset + 3] = 255;
          }
        }
        return output;
      };

      const sharpened = sharpen(ctx, ctx.getImageData(0, 0, canvas.width, canvas.height));
      ctx.putImageData(sharpened, 0, 0);

      // Step 4 (optional): Binarization
      const finalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const finalPixels = finalData.data;
      for (let i = 0; i < finalPixels.length; i += 4) {
        const avg = finalPixels[i]; // grayscale
        const bin = avg > 120 ? 255 : 0;
        finalPixels[i] = finalPixels[i + 1] = finalPixels[i + 2] = bin;
      }
      ctx.putImageData(finalData, 0, 0);

      // Step 5: OCR
      const filteredImageData = canvas.toDataURL("image/png");

      try {
        const { data } = await Tesseract.recognize(filteredImageData, "eng", {
          tessedit_char_whitelist: "0123456789",
        } as any);

        console.log(data.text,"tjis ois texcdfed")
      const match = data.text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);

        const cleanedId = match ? match[0] : "No ID found";
        setIdText(cleanedId);
      } catch (err) {
        console.error("OCR error:", err);
        setIdText("Error during OCR");
      }

      setLoading(false);
    };
  };

  return { idText, loading, performOCR, setIdText };
}
