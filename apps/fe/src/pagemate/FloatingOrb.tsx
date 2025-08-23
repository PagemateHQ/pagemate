import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { CornerPosition, useDraggable } from '@/hooks/useDraggable';

import { IntroView } from './views';

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

  useEffect(() => {
    if (showIntro && dragRef.current) {
      const orbRect = dragRef.current.getBoundingClientRect();
      const viewWidth = 471;
      const viewHeight = 577;
      const gap = 24;

      // Determine current corner based on position
      const isTop = orbRect.top < window.innerHeight / 2;
      const isLeft = orbRect.left < window.innerWidth / 2;
      const corner: CornerPosition =
        `${isTop ? 'top' : 'bottom'}-${isLeft ? 'left' : 'right'}` as CornerPosition;
      setCurrentCorner(corner);

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
    }
  }, [showIntro]);

  // Handle click outside to close
  useEffect(() => {
    if (showIntro) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
          !target.closest('.intro-view-container') &&
          !dragRef.current?.contains(target)
        ) {
          setShowIntro(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showIntro]);

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
          <motion.div
            className="intro-view-container"
            style={{
              position: 'fixed',
              top: introPosition.top,
              left: introPosition.left,
              zIndex: 10000,
            }}
            initial={{
              opacity: 0,
              y: currentCorner.includes('bottom') ? 10 : -10,
              scale: 0.95,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: currentCorner.includes('bottom') ? 10 : -10,
              scale: 0.95,
            }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1] as [number, number, number, number],
              scale: { duration: 0.4 },
            }}
          >
            <IntroView onClose={() => setShowIntro(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

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
