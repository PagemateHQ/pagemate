import { useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  snapToCorners?: boolean;
  cornerGap?: number;
  onDragStart?: () => void;
  onDragEnd?: (position: Position) => void;
}

export const useDraggable = (options: UseDraggableOptions = {}) => {
  const { 
    snapToCorners = true, 
    cornerGap = 48,
    onDragStart,
    onDragEnd 
  } = options;
  
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>(() => {
    if (typeof window === 'undefined') {
      return { x: 0, y: 0 };
    }
    return { x: window.innerWidth - 112, y: window.innerHeight - 112 };
  });
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState<Position>({ x: 0, y: 0 });

  const snapToNearestCorner = (x: number, y: number) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const elementSize = 64;
    
    const corners = [
      { x: cornerGap, y: cornerGap }, // top-left
      { x: windowWidth - cornerGap - elementSize, y: cornerGap }, // top-right
      { x: cornerGap, y: windowHeight - cornerGap - elementSize }, // bottom-left
      { x: windowWidth - cornerGap - elementSize, y: windowHeight - cornerGap - elementSize } // bottom-right
    ];
    
    // Find nearest corner
    let nearestCorner = corners[0];
    let minDistance = Infinity;
    
    corners.forEach(corner => {
      const distance = Math.sqrt(
        Math.pow(x - corner.x, 2) + Math.pow(y - corner.y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCorner = corner;
      }
    });
    
    return nearestCorner;
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!elementRef.current) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStart({ x: position.x, y: position.y });
    
    if (onDragStart) onDragStart();
    
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setPosition({
      x: elementStart.x + deltaX,
      y: elementStart.y + deltaY
    });
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (snapToCorners) {
      const snappedPosition = snapToNearestCorner(position.x, position.y);
      setPosition(snappedPosition);
      if (onDragEnd) onDragEnd(snappedPosition);
    } else {
      if (onDragEnd) onDragEnd(position);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (!elementRef.current) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setElementStart({ x: position.x, y: position.y });
    
    if (onDragStart) onDragStart();
    
    e.preventDefault();
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    
    setPosition({
      x: elementStart.x + deltaX,
      y: elementStart.y + deltaY
    });
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (snapToCorners) {
      const snappedPosition = snapToNearestCorner(position.x, position.y);
      setPosition(snappedPosition);
      if (onDragEnd) onDragEnd(snappedPosition);
    } else {
      if (onDragEnd) onDragEnd(position);
    }
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = (e: MouseEvent) => handleMouseUp(e);
    const handleGlobalTouchMove = (e: TouchEvent) => handleTouchMove(e);
    const handleGlobalTouchEnd = (e: TouchEvent) => handleTouchEnd(e);
    
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, dragStart, elementStart, position]);

  // Initialize position on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialPosition = snapToNearestCorner(
        window.innerWidth - 112, 
        window.innerHeight - 112
      );
      setPosition(initialPosition);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      if (snapToCorners) {
        const snappedPosition = snapToNearestCorner(position.x, position.y);
        setPosition(snappedPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, snapToCorners]);

  return {
    ref: elementRef,
    isDragging,
    position,
    style: {
      position: 'fixed' as const,
      left: `${position.x}px`,
      top: `${position.y}px`,
      cursor: isDragging ? 'grabbing' : 'grab',
      transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
      userSelect: 'none' as const,
      touchAction: 'none' as const,
    }
  };
};