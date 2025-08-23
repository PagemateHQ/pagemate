import { useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

export type CornerPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

interface UseDraggableOptions {
  snapToCorners?: boolean;
  cornerGap?: number;
  initialCorner?: CornerPosition;
  onDragStart?: () => void;
  onDragEnd?: (position: Position) => void;
}

export const useDraggable = (options: UseDraggableOptions = {}) => {
  const {
    snapToCorners = true,
    cornerGap = 48,
    initialCorner = 'bottom-right',
    onDragStart,
    onDragEnd,
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState<Position>({ x: 0, y: 0 });

  const getCornerPosition = (corner: CornerPosition): Position => {
    if (typeof window === 'undefined') {
      return { x: 0, y: 0 };
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const elementSize = 64;

    switch (corner) {
      case 'top-left':
        return { x: cornerGap, y: cornerGap };
      case 'top-right':
        return { x: windowWidth - cornerGap - elementSize, y: cornerGap };
      case 'bottom-left':
        return { x: cornerGap, y: windowHeight - cornerGap - elementSize };
      case 'bottom-right':
      default:
        return {
          x: windowWidth - cornerGap - elementSize,
          y: windowHeight - cornerGap - elementSize,
        };
    }
  };

  const snapToNearestCorner = (x: number, y: number): Position => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const elementSize = 64;

    const corners = [
      { x: cornerGap, y: cornerGap }, // top-left
      { x: windowWidth - cornerGap - elementSize, y: cornerGap }, // top-right
      { x: cornerGap, y: windowHeight - cornerGap - elementSize }, // bottom-left
      {
        x: windowWidth - cornerGap - elementSize,
        y: windowHeight - cornerGap - elementSize,
      }, // bottom-right
    ];

    // Find nearest corner
    let nearestCorner = corners[0];
    let minDistance = Infinity;

    corners.forEach((corner) => {
      const distance = Math.sqrt(
        Math.pow(x - corner.x, 2) + Math.pow(y - corner.y, 2),
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

    // If this is the first drag, calculate initial position from element's current position
    if (!hasBeenDragged) {
      const rect = elementRef.current.getBoundingClientRect();
      const initialPos = { x: rect.left, y: rect.top };
      setPosition(initialPos);
      setElementStart(initialPos);
      setHasBeenDragged(true);
    } else {
      setElementStart(position || { x: 0, y: 0 });
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });

    if (onDragStart) onDragStart();

    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !position) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setPosition({
      x: elementStart.x + deltaX,
      y: elementStart.y + deltaY,
    });
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging || !position) return;

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

    // If this is the first drag, calculate initial position from element's current position
    if (!hasBeenDragged) {
      const rect = elementRef.current.getBoundingClientRect();
      const initialPos = { x: rect.left, y: rect.top };
      setPosition(initialPos);
      setElementStart(initialPos);
      setHasBeenDragged(true);
    } else {
      setElementStart(position || { x: 0, y: 0 });
    }

    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });

    if (onDragStart) onDragStart();

    e.preventDefault();
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !position) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;

    setPosition({
      x: elementStart.x + deltaX,
      y: elementStart.y + deltaY,
    });
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isDragging || !position) return;

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
    element.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });

    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = (e: MouseEvent) => handleMouseUp(e);
    const handleGlobalTouchMove = (e: TouchEvent) => handleTouchMove(e);
    const handleGlobalTouchEnd = (e: TouchEvent) => handleTouchEnd(e);

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, {
        passive: false,
      });
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
  }, [isDragging, dragStart, elementStart, position, hasBeenDragged]);

  // Handle window resize
  useEffect(() => {
    if (typeof window === 'undefined' || !hasBeenDragged || !position) return;

    const handleResize = () => {
      if (snapToCorners) {
        const snappedPosition = snapToNearestCorner(position.x, position.y);
        setPosition(snappedPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, snapToCorners, hasBeenDragged]);

  // Get CSS position for initial corner
  const getCSSPosition = () => {
    switch (initialCorner) {
      case 'top-left':
        return { top: `${cornerGap}px`, left: `${cornerGap}px` };
      case 'top-right':
        return { top: `${cornerGap}px`, right: `${cornerGap}px` };
      case 'bottom-left':
        return { bottom: `${cornerGap}px`, left: `${cornerGap}px` };
      case 'bottom-right':
      default:
        return { bottom: `${cornerGap}px`, right: `${cornerGap}px` };
    }
  };

  // Return different styles based on whether it has been dragged
  const style =
    hasBeenDragged && position
      ? {
          position: 'fixed' as const,
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging
            ? 'none'
            : 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
          userSelect: 'none' as const,
          touchAction: 'none' as const,
        }
      : {
          position: 'fixed' as const,
          ...getCSSPosition(),
          cursor: 'grab',
          transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
          userSelect: 'none' as const,
          touchAction: 'none' as const,
        };

  return {
    ref: elementRef,
    isDragging,
    position,
    style,
  };
};
