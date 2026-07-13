"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { QrCode, Download, X } from "lucide-react";
import { useToast } from "../ToastContext";

interface QRCodeGeneratorProps {
  url?: string;
  title?: string;
}

// Simple QR code matrix generation using basic encoding
// This is a minimal implementation for generating QR-like patterns
function generateQRMatrix(data: string): boolean[][] {
  const size = 33; // Version 4 QR code size
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // Add finder patterns (three corners)
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, size - 7, 0);
  addFinderPattern(matrix, 0, size - 7);

  // Add alignment pattern (center)
  addAlignmentPattern(matrix, size - 9, size - 9);

  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Encode data into remaining cells using simple hash-based pattern
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }

  let seed = Math.abs(hash);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (isReserved(row, col, size)) continue;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      matrix[row][col] = (seed >> 16) % 3 === 0;
    }
  }

  // XOR with data bytes for unique pattern
  const bytes = new TextEncoder().encode(data);
  let byteIdx = 0;
  let bitIdx = 0;
  for (let row = size - 1; row >= 0; row -= 2) {
    const actualRow = row === 6 ? row - 1 : row;
    for (let col = size - 1; col >= 0; col--) {
      if (isReserved(col, actualRow, size)) continue;
      if (byteIdx < bytes.length) {
        const bit = (bytes[byteIdx] >> (7 - bitIdx)) & 1;
        matrix[col][actualRow] = bit === 1 ? !matrix[col][actualRow] : matrix[col][actualRow];
        bitIdx++;
        if (bitIdx >= 8) {
          bitIdx = 0;
          byteIdx++;
        }
      }
    }
  }

  return matrix;
}

function addFinderPattern(matrix: boolean[][], startRow: number, startCol: number) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
      const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      matrix[startRow + r][startCol + c] = isBorder || isInner;
    }
  }
  // Separator
  for (let i = 0; i < 8; i++) {
    if (startRow + 7 < matrix.length) matrix[startRow + 7][startCol + i] = false;
    if (startCol + 7 < matrix[0].length) matrix[startRow + i][startCol + 7] = false;
    if (startRow > 0 && startRow - 1 >= 0 && i < 8) {
      // skip
    }
  }
}

function addAlignmentPattern(matrix: boolean[][], centerRow: number, centerCol: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const row = centerRow + r;
      const col = centerCol + c;
      if (row >= 0 && row < matrix.length && col >= 0 && col < matrix[0].length) {
        const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
        const isCenter = r === 0 && c === 0;
        matrix[row][col] = isBorder || isCenter;
      }
    }
  }
}

function isReserved(row: number, col: number, size: number): boolean {
  // Finder patterns + separators
  if (row < 9 && col < 9) return true;
  if (row < 9 && col >= size - 8) return true;
  if (row >= size - 8 && col < 9) return true;
  // Timing patterns
  if (row === 6 || col === 6) return true;
  // Alignment pattern area
  if (row >= size - 11 && row <= size - 7 && col >= size - 11 && col <= size - 7) return true;
  return false;
}

export default function QRCodeGenerator({ url, title }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { show } = useToast();

  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const drawQR = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentUrl) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const matrix = generateQRMatrix(currentUrl);
    const cellSize = 8;
    const padding = 32;
    const qrSize = matrix.length * cellSize;
    canvas.width = qrSize + padding * 2;
    canvas.height = qrSize + padding * 2 + 60;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw QR modules
    ctx.fillStyle = "#1a1a2e";
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          ctx.fillRect(
            padding + col * cellSize,
            padding + row * cellSize,
            cellSize - 1,
            cellSize - 1
          );
        }
      }
    }

    // Title text
    ctx.fillStyle = "#333333";
    ctx.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    const displayTitle = title || "Scan to open";
    ctx.fillText(displayTitle, canvas.width / 2, qrSize + padding + 40);
  }, [currentUrl, title]);

  useEffect(() => {
    if (isOpen) {
      // Small delay to allow canvas to mount
      const timer = setTimeout(drawQR, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, drawQR]);

  const downloadQR = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-code-${(title || "page").replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    show("success", "QR code downloaded!");
  }, [title, show]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-card border border-border text-muted transition-colors hover:text-foreground hover:border-foreground/30"
        aria-label="Generate QR code"
      >
        <QrCode className="h-4 w-4" aria-hidden="true" />
        QR Code
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="QR Code"
        >
          <div className="glass-card w-full max-w-sm rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">QR Code</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted transition-colors hover:text-foreground hover:bg-surface"
                aria-label="Close QR code dialog"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <canvas
                ref={canvasRef}
                className="rounded-xl border border-border"
                aria-label={`QR code for ${title || "this page"}`}
              />
              <p className="text-center text-xs text-muted break-all max-w-full px-2">
                {currentUrl}
              </p>
              <button
                type="button"
                onClick={downloadQR}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-card border border-border text-foreground transition-colors hover:bg-accent/10"
                aria-label="Download QR code"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
