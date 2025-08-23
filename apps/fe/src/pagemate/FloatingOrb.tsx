import styled from '@emotion/styled';
import { AnimatePresence } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { CornerPosition, useDraggable } from '@/hooks/useDraggable';

import { PagemateChat } from './PagemateChat';

interface FloatingOrbProps {
  initialCorner?: CornerPosition;
  cornerGap?: number;
}

export const FloatingOrb: React.FC<FloatingOrbProps> = ({
  initialCorner = 'bottom-right',
  cornerGap = 48,
}) => {
  const [showView, setShowView] = useState(false);
  const [viewPosition, setViewPosition] = useState({ top: 0, left: 0 });
  const [currentCorner, setCurrentCorner] =
    useState<CornerPosition>(initialCorner);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const orbElementRef = useRef<HTMLDivElement | null>(null);

  const updateViewPosition = useCallback(() => {
    if (!orbElementRef.current) return;

    const orbRect = orbElementRef.current.getBoundingClientRect();
    const viewWidth = 471;
    const viewHeight = 577;
    const gap = 24;

    // Determine current corner based on position
    const isTop = orbRect.top < window.innerHeight / 2;
    const isLeft = orbRect.left < window.innerWidth / 2;
    const corner: CornerPosition =
      `${isTop ? 'top' : 'bottom'}-${isLeft ? 'left' : 'right'}` as CornerPosition;

    let top = 0;
    let left = 0;

    if (corner.includes('bottom')) {
      // Position above the orb
      top = orbRect.top - viewHeight - gap;
    } else {
      // Position below the orb
      top = orbRect.bottom + gap;
    }

    if (corner.includes('right')) {
      // Align to the right edge of the orb
      left = orbRect.right - viewWidth;
    } else {
      // Align to the left edge of the orb
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

  // Handle window resize with throttling
  useEffect(() => {
    if (!showView) return;

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateViewPosition();
      }, 100); // Throttle to 100ms
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [showView, updateViewPosition]);

  // Removed click outside handler - view only closes when clicking the orb

  const handleMouseDown = (e: React.MouseEvent) => {
    // Record the start position
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleOrbClick = (e: React.MouseEvent) => {
    // Don't toggle if currently dragging
    if (isDragging) {
      return;
    }

    // Check if the mouse moved significantly (dragged)
    if (dragStartPosRef.current) {
      const dx = Math.abs(e.clientX - dragStartPosRef.current.x);
      const dy = Math.abs(e.clientY - dragStartPosRef.current.y);
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
        onClick={handleOrbClick}
      />
      <AnimatePresence>
        {showView && (
          <ViewContainerWrapper
            style={{
              top: viewPosition.top,
              left: viewPosition.left,
            }}
          >
            <PagemateChat
              isOpen={showView}
              onClose={() => setShowView(false)}
            />
          </ViewContainerWrapper>
        )}
      </AnimatePresence>
    </>
  );
};

const ViewContainerWrapper = styled.div`
  position: fixed;
  z-index: 10000;
`;

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
  z-index: 9999;
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
