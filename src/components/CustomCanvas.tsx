import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pen, Eraser, RotateCcw, Download } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  timestamp: number;
}

interface CustomCanvasProps {
  width?: number;
  height?: number;
  onStrokeComplete?: (strokes: Stroke[]) => void;
  className?: string;
}

export function CustomCanvas({ 
  width = 800, 
  height = 600, 
  onStrokeComplete,
  className = '' 
}: CustomCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [penColor, setPenColor] = useState('#00d4ff');
  const [penWidth, setPenWidth] = useState(3);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Set drawing properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [width, height]);

  // Redraw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Redraw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.globalCompositeOperation = stroke.color === 'transparent' ? 'destination-out' : 'source-over';

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      ctx.stroke();
    });

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }, [strokes, width, height]);

  // Redraw when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Get mouse/touch position relative to canvas
  const getEventPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getEventPos(e);
    setIsDrawing(true);
    setCurrentStroke([pos]);
  };

  // Continue drawing
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const pos = getEventPos(e);
    const newStroke = [...currentStroke, pos];
    setCurrentStroke(newStroke);

    // Draw current stroke in real-time
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = tool === 'eraser' ? 'transparent' : penColor;
    ctx.lineWidth = tool === 'eraser' ? penWidth * 2 : penWidth;
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';

    if (currentStroke.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentStroke[currentStroke.length - 1].x, currentStroke[currentStroke.length - 1].y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
  };

  // Stop drawing
  const stopDrawing = () => {
    if (!isDrawing || currentStroke.length === 0) return;

    const newStroke: Stroke = {
      points: currentStroke,
      color: tool === 'eraser' ? 'transparent' : penColor,
      width: tool === 'eraser' ? penWidth * 2 : penWidth,
      timestamp: Date.now()
    };

    const updatedStrokes = [...strokes, newStroke];
    setStrokes(updatedStrokes);
    setCurrentStroke([]);
    setIsDrawing(false);

    // Notify parent component
    if (onStrokeComplete) {
      onStrokeComplete(updatedStrokes);
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke([]);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    if (onStrokeComplete) {
      onStrokeComplete([]);
    }
  };

  // Download canvas as image
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'ekopen-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="border border-gray-700 rounded-lg cursor-crosshair touch-none"
        style={{ maxWidth: '100%', height: 'auto' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      {/* Toolbar */}
      <div className="absolute top-4 left-4 glass rounded-xl p-3 flex items-center space-x-3">
        {/* Tool Selection */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'pen' 
                ? 'bg-cyan-500/30 text-cyan-400' 
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
            }`}
            title="Pen Tool"
          >
            <Pen className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-all ${
              tool === 'eraser' 
                ? 'bg-red-500/30 text-red-400' 
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
            }`}
            title="Eraser Tool"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-600" />

        {/* Color Picker */}
        {tool === 'pen' && (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-600 bg-transparent cursor-pointer"
              title="Pen Color"
            />
          </div>
        )}

        {/* Width Slider */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={penWidth}
            onChange={(e) => setPenWidth(Number(e.target.value))}
            className="w-16 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            title="Brush Size"
          />
          <span className="text-xs text-gray-400 w-6">{penWidth}</span>
        </div>

        <div className="w-px h-6 bg-gray-600" />

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={clearCanvas}
            className="p-2 bg-gray-700/50 text-gray-400 rounded-lg hover:bg-gray-600/50 transition-all"
            title="Clear Canvas"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={downloadCanvas}
            className="p-2 bg-gray-700/50 text-gray-400 rounded-lg hover:bg-gray-600/50 transition-all"
            title="Download Image"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="absolute bottom-4 left-4 glass rounded-lg px-3 py-2">
        <div className="text-xs text-gray-400">
          Strokes: {strokes.length} | Tool: {tool} | Size: {penWidth}px
        </div>
      </div>
    </div>
  );
}