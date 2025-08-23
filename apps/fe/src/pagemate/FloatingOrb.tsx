import styled from '@emotion/styled';
import { AnimatePresence } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';

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
  const [showIntro, setShowIntro] = useState(false);
  const [introPosition, setIntroPosition] = useState({ top: 0, left: 0 });
  const [currentCorner, setCurrentCorner] =
    useState<CornerPosition>(initialCorner);

  const {
    ref: dragRef,
    style,
    isDragging,
  } = useDraggable({
    snapToCorners: true,
    cornerGap,
    initialCorner,
  });

  const updateIntroPosition = useCallback(() => {
    if (!dragRef.current) return;

    const orbRect = dragRef.current.getBoundingClientRect();
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

    setIntroPosition({ top, left });
    setCurrentCorner(corner);
  }, []);

  useEffect(() => {
    if (showIntro) {
      updateIntroPosition();
    }
  }, [showIntro, updateIntroPosition]);

  // Update position when orb moves
  useEffect(() => {
    if (showIntro) {
      updateIntroPosition();
    }
  }, [style.left, style.top]); // Depend on position changes

  // Handle window resize with throttling
  useEffect(() => {
    if (!showIntro) return;

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateIntroPosition();
      }, 100); // Throttle to 100ms
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [showIntro, updateIntroPosition]);

  // Removed click outside handler - view only closes when clicking the orb

  const handleOrbClick = () => {
    if (!isDragging) {
      setShowIntro(!showIntro);
    }
  };

  return (
    <>
      <StyledFloatingOrb
        ref={dragRef}
        style={style}
        $isDragging={isDragging}
        onClick={handleOrbClick}
      />
      <AnimatePresence>
        {showIntro && (
          <ViewContainerWrapper
            style={{
              top: introPosition.top,
              left: introPosition.left,
            }}
          >
            <PagemateChat isOpen={showIntro} onClose={() => setShowIntro(false)} />
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
