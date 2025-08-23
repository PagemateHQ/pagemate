import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { CornerPosition, useDraggable } from '@/hooks/useDraggable';

import { PagemateChat } from './PagemateChat';

interface FloatingOrbProps {
  initialCorner?: CornerPosition;
  cornerGap?: number;
  defaultSuggestions: string[]; // Required
}

export const FloatingOrb: React.FC<FloatingOrbProps> = ({
  initialCorner = 'bottom-right',
  cornerGap = 48,
  defaultSuggestions,
}) => {
  const [showView, setShowView] = useState(false);
  const [viewPosition, setViewPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const [currentCorner, setCurrentCorner] =
    useState<CornerPosition>(initialCorner);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const orbElementRef = useRef<HTMLDivElement | null>(null);
  const viewElementRef = useRef<HTMLDivElement | null>(null);

  // Initialize view position based on window dimensions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Calculate initial position based on bottom-right corner
      const viewWidth = 471;
      const viewHeight = 577;
      const orbSize = 64;
      const gap = 24;

      // Position for bottom-right corner (converted to top-left coordinates)
      const initialTop =
        window.innerHeight - viewHeight - orbSize - gap - cornerGap;
      const initialLeft = window.innerWidth - viewWidth;

      setViewPosition({
        top: Math.max(8, initialTop),
        left: Math.max(8, initialLeft),
      });
    }
  }, []); // Run once on mount

  const updateViewPosition = useCallback(() => {
    if (!orbElementRef.current) return;

    const orbRect = orbElementRef.current.getBoundingClientRect();
    const gap = 24;

    // Get actual view dimensions or use defaults
    const viewWidth = viewElementRef.current?.offsetWidth || 471;
    const viewHeight = viewElementRef.current?.offsetHeight || 577;

    // Determine current corner based on orb position
    const isTop = orbRect.top < window.innerHeight / 2;
    const isLeft = orbRect.left < window.innerWidth / 2;
    const corner: CornerPosition =
      `${isTop ? 'top' : 'bottom'}-${isLeft ? 'left' : 'right'}` as CornerPosition;

    let top = 0;
    let left = 0;

    // Vertical positioning
    if (corner.includes('bottom')) {
      // Orb is at bottom - position view above the orb
      top = orbRect.top - viewHeight - gap;
    } else {
      // Orb is at top - position view below the orb
      top = orbRect.bottom + gap;
    }

    // Horizontal positioning
    if (corner.includes('right')) {
      // Orb is at right - align view's right edge with orb's right edge
      left = orbRect.right - viewWidth;
    } else {
      // Orb is at left - align view's left edge with orb's left edge
      left = orbRect.left;
    }

    // Ensure the view stays within viewport bounds
    left = Math.max(8, Math.min(left, window.innerWidth - viewWidth - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - viewHeight - 8));

    setViewPosition({ top, left });
    setCurrentCorner(corner);
  }, []);

  const {
    ref: dragRef,
    style,
    isDragging,
  } = useDraggable({
    snapToCorners: true,
    cornerGap,
    initialCorner,
    onDragEnd: () => {
      // Update view position when drag ends
      if (showView) {
        setTimeout(() => {
          updateViewPosition();
        }, 300);
      }
    },
  });

  // Sync orbElementRef with dragRef
  useEffect(() => {
    if (dragRef.current) {
      orbElementRef.current = dragRef.current;
    }
  }, [dragRef, style]); // Update when style changes too

  // Update view position when it becomes visible
  useEffect(() => {
    if (showView) {
      updateViewPosition();
    }
  }, [showView, updateViewPosition]);

  // Handle window resize with proper debouncing
  useEffect(() => {
    if (!showView) return;

    let resizeTimer: NodeJS.Timeout | null = null;
    let isResizing = false;

    const handleResize = () => {
      // Mark that we're resizing
      isResizing = true;

      // Clear existing timer
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }

      // Set new timer for debounce
      resizeTimer = setTimeout(() => {
        updateViewPosition();
        isResizing = false;
      }, 300); // Debounce delay
    };

    window.addEventListener('resize', handleResize);

    return () => {
      // Cleanup: if still resizing, do final update
      if (resizeTimer) {
        clearTimeout(resizeTimer);
        if (isResizing) {
          updateViewPosition();
        }
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [showView, updateViewPosition]);

  // Removed click outside handler - view only closes when clicking the orb

  const handleMouseDown = (e: React.MouseEvent) => {
    // Record the start position
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Record the start position for touch
    const touch = e.touches[0];
    dragStartPosRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleOrbClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Don't toggle if currently dragging
    if (isDragging) {
      return;
    }

    // Get the appropriate coordinates based on event type
    let currentX: number, currentY: number;
    if ('touches' in e) {
      // Touch event - use changedTouches for touchend
      const touch = e.changedTouches?.[0] || e.touches?.[0];
      if (!touch) return;
      currentX = touch.clientX;
      currentY = touch.clientY;
    } else {
      // Mouse event
      currentX = e.clientX;
      currentY = e.clientY;
    }

    // Check if the pointer moved significantly (dragged)
    if (dragStartPosRef.current) {
      const dx = Math.abs(currentX - dragStartPosRef.current.x);
      const dy = Math.abs(currentY - dragStartPosRef.current.y);
      const threshold = 5; // pixels

      if (dx > threshold || dy > threshold) {
        // This was a drag, not a click
        dragStartPosRef.current = null;
        return;
      }
    }

    setShowView(!showView);
  };

  return (
    <>
      <StyledFloatingOrb
        ref={dragRef}
        style={style}
        $isDragging={isDragging}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleOrbClick}
        onClick={handleOrbClick}
      />
      <AnimatePresence>
        {showView && (
          <MotionViewContainerWrapper
            ref={viewElementRef}
            initial={{
              opacity: 0,
              scale: 0.95,
              top: viewPosition.top,
              left: viewPosition.left,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              top: viewPosition.top,
              left: viewPosition.left,
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              opacity: { duration: 0.2 },
            }}
          >
            <PagemateChat
              isOpen={showView}
              onClose={() => setShowView(false)}
              defaultSuggestions={defaultSuggestions}
            />
          </MotionViewContainerWrapper>
        )}
      </AnimatePresence>
    </>
  );
};

const ViewContainerWrapper = styled.div`
  position: fixed;
  z-index: 10000;
`;

const MotionViewContainerWrapper = motion(ViewContainerWrapper);

const StyledFloatingOrb = styled.div<{ $isDragging?: boolean }>`
  width: 64px;
  height: 64px;
  border-radius: 46px;
  background: radial-gradient(
    70.71% 70.71% at 41.41% 30.47%,
    rgba(255, 255, 255, 1) 0%,
    rgba(239, 250, 255, 1) 100%
  );
  border: 1px solid #dbf3ff;
  box-shadow: ${(props) =>
    props.$isDragging
      ? '0px 15px 30px 0px rgba(106, 219, 255, 0.45)'
      : '0px 10px 22px 0px rgba(106, 219, 255, 0.32)'};
  transform: ${(props) => (props.$isDragging ? 'scale(1.05)' : 'scale(1)')};
  z-index: 10000000000;
  cursor: ${(props) => (props.$isDragging ? 'grabbing' : 'pointer')};

  &:hover {
    transform: scale(1.05);
    box-shadow: 0px 12px 25px 0px rgba(106, 219, 255, 0.38);
  }

  &:active {
    transform: scale(1.08);
  }

  &::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 9px;
    width: 53px;
    height: 53px;
    background: url('/assets/logo.png') center/cover no-repeat;
    filter: blur(5.742px);
    opacity: 0.47;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    left: 9.68px;
    top: 9px;
    width: 45.639px;
    height: 45.639px;
    background: url('/assets/logo.png') center/cover no-repeat;
    pointer-events: none;
  }
`;
