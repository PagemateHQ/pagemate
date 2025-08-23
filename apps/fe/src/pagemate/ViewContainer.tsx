import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import React from 'react';

import { InputBar } from './InputBar';

interface ViewContainerProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  onSendMessage?: (message: string) => void;
  loading?: boolean;
  showInput?: boolean;
}

export const ViewContainer: React.FC<ViewContainerProps> = ({
  children,
  isOpen = true,
  onClose,
  onSendMessage,
  loading = false,
  showInput = true,
}) => {
  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1],
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2,
        ease: [0.4, 0.0, 0.6, 1],
      },
    },
  } as const;

  if (!isOpen) return null;

  return (
    <MotionContainer
      id="pagemate-view-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <CircleGlow />

      <Content>{children}</Content>

      {showInput && onSendMessage && (
        <InputBar onSendMessage={onSendMessage} loading={loading} />
      )}

      <BottomBlurImage src="/assets/intro-bottom-blur.png" alt="" />
    </MotionContainer>
  );
};

const _Container = styled.div`
  position: relative;
  width: 471px;
  height: 577px;
  overflow: hidden;

  border-radius: 12px;
  border: 1px solid #abdcf6;
  background:
    linear-gradient(
      0deg,
      rgba(236, 250, 255, 0.33) 0%,
      rgba(236, 250, 255, 0.33) 100%
    ),
    rgba(234, 249, 255, 0.6);
  box-shadow: 0 10px 32px 0 rgba(106, 219, 255, 0.3);

  /* TODO: if hardware acceleration is enabled, make backdrop filter to blur(8px) */
  backdrop-filter: blur(4px);

  /* dark mode */
  html.dark & {
    background:
      linear-gradient(
        0deg,
        rgba(236, 250, 255, 0.33) 0%,
        rgba(236, 250, 255, 0.33) 100%
      ),
      rgba(234, 249, 255, 1);
    backdrop-filter: none;
  }
`;

const MotionContainer = motion(_Container);

const CircleGlow = styled.div`
  position: absolute;
  width: 403px;
  height: 359px;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: url('/assets/intro-circle.svg');
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
`;

const Content = styled.div`
  width: 100%;
  height: 100%;

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BottomBlurImage = styled.img`
  width: 377px;
  height: 212px;

  object-fit: contain;
  object-position: bottom center;

  position: absolute;
  left: 50%;
  bottom: -1px;
  transform: translateX(-50%);
  z-index: -1;
`;
