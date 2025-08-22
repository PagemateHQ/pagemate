import styled from '@emotion/styled';
import React from 'react';

import { useDraggable } from '@/hooks/useDraggable';

export const FloatingOrb: React.FC = () => {
  const { ref, style, isDragging } = useDraggable({
    snapToCorners: true,
    cornerGap: 48,
  });

  return <StyledFloatingOrb ref={ref} style={style} $isDragging={isDragging} />;
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
