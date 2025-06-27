import React, { useRef, useEffect } from 'react';

interface CanvasDrawingProps {
  width?: number;
  height?: number;
  className?: string;
}

export function CanvasDrawing({ width = 800, height = 600, className = '' }: CanvasDrawingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear canvas with a dark background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw a beautiful geometric pattern
    drawGeometricPattern(ctx, width, height);
  }, [width, height]);

  const drawGeometricPattern = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const centerX = w / 2;
    const centerY = h / 2;

    // Draw concentric circles with gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
    gradient.addColorStop(0, '#00d4ff');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, 'transparent');

    // Outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 180, 0, Math.PI * 2);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Middle circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw radiating lines
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const startX = centerX + Math.cos(angle) * 60;
      const startY = centerY + Math.sin(angle) * 60;
      const endX = centerX + Math.cos(angle) * 180;
      const endY = centerY + Math.sin(angle) * 180;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // Draw decorative triangles
    ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = centerX + Math.cos(angle) * 140;
      const y = centerY + Math.sin(angle) * 140;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 15 * Math.cos(angle + Math.PI / 3), y + 15 * Math.sin(angle + Math.PI / 3));
      ctx.lineTo(x + 15 * Math.cos(angle - Math.PI / 3), y + 15 * Math.sin(angle - Math.PI / 3));
      ctx.closePath();
      ctx.fill();
    }

    // Add text in the center
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EkoPen', centerX, centerY - 10);
    
    ctx.font = '14px Inter';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Agentic Writing Tool', centerX, centerY + 15);
  };

  return (
    <canvas
      ref={canvasRef}
      className={`border border-gray-700 rounded-lg ${className}`}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}