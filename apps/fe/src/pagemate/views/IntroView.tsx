import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import React from 'react';

import { SparkleIcon } from '@/components/icons/SparkleIcon';

interface IntroViewProps {
  onClose?: () => void;
}

export const IntroView: React.FC<IntroViewProps> = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0.0, 0.2, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <MotionContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <CircleGlow />

      <Content>
        <LogoSection>
          <LogoWrapper>
            <LogoBlur />
            <Logo />
            <LogoOverlay>
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
            </LogoOverlay>
          </LogoWrapper>
          <MotionTextContent variants={itemVariants}>
            <Title>
              Pagemate is here
              <br />
              to guide you
            </Title>
            <Subtitle>
              <HighlightedText>
                Hi, I'm Pagemate, your own AI Agent!
              </HighlightedText>
              <br />
              Ask me anything about the product,
              <br />
              such as but not limited to:
            </Subtitle>
          </MotionTextContent>
        </LogoSection>

        <MotionSuggestionsContainer variants={itemVariants}>
          <MotionSuggestionButton
            whileHover={{
              scale: 1.02,
              backgroundColor: 'rgba(171, 220, 246, 0.45)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            Help me find a specific transaction
          </MotionSuggestionButton>
          <MotionSuggestionButton
            whileHover={{
              scale: 1.02,
              backgroundColor: 'rgba(171, 220, 246, 0.45)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            How can I transfer money between accounts?
          </MotionSuggestionButton>
          <MotionSuggestionButton
            whileHover={{
              scale: 1.02,
              backgroundColor: 'rgba(171, 220, 246, 0.45)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            How do I deposit a check?
          </MotionSuggestionButton>
        </MotionSuggestionsContainer>

        <MotionInputContainer variants={itemVariants}>
          <InputIcon>
            <SparkleIcon />
          </InputIcon>
          <InputContent>
            <InputText>How can I transfer money between accounts?</InputText>
            <InputLabel>Turbo Mode</InputLabel>
          </InputContent>
        </MotionInputContainer>
      </Content>

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
  padding: 16px 8px 8px;
  height: 100%;

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoSection = styled.div`
  padding-top: 32px;
  padding-bottom: 64px;

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 407px;
`;

const LogoWrapper = styled.div`
  position: relative;
  width: 180px;
  height: 180px;
  margin-bottom: -64px;
`;

const LogoBlur = styled.div`
  position: absolute;
  width: 180px;
  height: 180px;
  left: 0;
  top: 0;
  background: url('/assets/logo.png') center/cover no-repeat;
  filter: blur(19.5px);
  opacity: 0.47;
`;

const Logo = styled.div`
  position: absolute;
  width: 155px;
  height: 155px;
  left: 12.4px;
  top: 0;
  background: url('/assets/logo.png') center/cover no-repeat;
`;

const LogoOverlay = styled.div`
  position: absolute;
  width: 180px;
  height: 180px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;

  .blur-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 180px;
    height: 180px;
    background: rgba(255, 255, 255, 0.01);
  }

  .blur-layer:nth-child(1) {
    backdrop-filter: blur(0.67px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 40%,
      rgba(0, 0, 0, 1) 42%,
      rgba(0, 0, 0, 1) 45%,
      rgba(0, 0, 0, 0) 47%
    );
  }

  .blur-layer:nth-child(2) {
    backdrop-filter: blur(1.33px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 44%,
      rgba(0, 0, 0, 1) 46%,
      rgba(0, 0, 0, 1) 49%,
      rgba(0, 0, 0, 0) 51%
    );
  }

  .blur-layer:nth-child(3) {
    backdrop-filter: blur(2px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 48%,
      rgba(0, 0, 0, 1) 50%,
      rgba(0, 0, 0, 1) 53%,
      rgba(0, 0, 0, 0) 55%
    );
  }

  .blur-layer:nth-child(4) {
    backdrop-filter: blur(2.67px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 52%,
      rgba(0, 0, 0, 1) 54%,
      rgba(0, 0, 0, 1) 57%,
      rgba(0, 0, 0, 0) 59%
    );
  }

  .blur-layer:nth-child(5) {
    backdrop-filter: blur(3.33px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 56%,
      rgba(0, 0, 0, 1) 58%,
      rgba(0, 0, 0, 1) 61%,
      rgba(0, 0, 0, 0) 63%
    );
  }

  .blur-layer:nth-child(6) {
    backdrop-filter: blur(4px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 60%,
      rgba(0, 0, 0, 1) 62%,
      rgba(0, 0, 0, 1) 65%,
      rgba(0, 0, 0, 0) 67%
    );
  }

  .blur-layer:nth-child(7) {
    backdrop-filter: blur(4.67px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 64%,
      rgba(0, 0, 0, 1) 66%,
      rgba(0, 0, 0, 1) 70%,
      rgba(0, 0, 0, 0) 72%
    );
  }

  .blur-layer:nth-child(8) {
    backdrop-filter: blur(5.33px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 68%,
      rgba(0, 0, 0, 1) 71%,
      rgba(0, 0, 0, 1) 75%,
      rgba(0, 0, 0, 0) 77%
    );
  }

  .blur-layer:nth-child(9) {
    backdrop-filter: blur(6px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 73%,
      rgba(0, 0, 0, 1) 76%,
      rgba(0, 0, 0, 1) 80%,
      rgba(0, 0, 0, 0) 82%
    );
  }

  .blur-layer:nth-child(10) {
    backdrop-filter: blur(6.67px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 78%,
      rgba(0, 0, 0, 1) 81%,
      rgba(0, 0, 0, 1) 85%,
      rgba(0, 0, 0, 0) 87%
    );
  }

  .blur-layer:nth-child(11) {
    backdrop-filter: blur(7.33px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 83%,
      rgba(0, 0, 0, 1) 86%,
      rgba(0, 0, 0, 1) 92%,
      rgba(0, 0, 0, 0) 95%
    );
  }

  .blur-layer:nth-child(12) {
    backdrop-filter: blur(8px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 88%,
      rgba(0, 0, 0, 1) 93%,
      rgba(0, 0, 0, 1) 100%
    );
  }
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
  width: 100%;
  margin-bottom: -64px;
  z-index: 3;
`;

const MotionTextContent = motion(TextContent);

const Title = styled.h1`
  /* add padding bottom to avoid bottom cutoff from tight line height  */
  padding-bottom: 2px;

  font-size: 36px;
  font-weight: 400;
  line-height: 1.04;
  letter-spacing: -1.44px;

  background: linear-gradient(180deg, #1a73e8 0%, #0093f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 18px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.72px;
  color: #6c8bab;
`;

const HighlightedText = styled.span`
  color: #0093f6;
`;

const _SuggestionsContainer = styled.div`
  margin-top: 28px;
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const MotionSuggestionsContainer = motion(_SuggestionsContainer);

const SuggestionButton = styled.button`
  width: fit-content;
  margin: 0 auto;

  background: rgba(171, 220, 246, 0.31);
  border: 1px solid rgba(0, 147, 246, 0.16);
  border-radius: 500px;
  padding: 7px 16px;

  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.56px;
  color: #0093f6;
  cursor: pointer;
  transition: background-color 0.2s ease;
`;

const MotionSuggestionButton = motion(SuggestionButton);

const InputContainer = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;

  display: flex;
  align-items: center;
  gap: 8px;

  padding: 12px;
  background: linear-gradient(
    180deg,
    rgba(234, 248, 255, 0.88) 0%,
    rgba(238, 250, 255, 0.88) 100%
  );
  border-radius: 8px;
  box-shadow: 0px 4px 9.9px 0px #bae3f8;
`;

const MotionInputContainer = motion(InputContainer);

const InputIcon = styled.div`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

const InputContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;
const InputText = styled.span`
  font-size: 16px;
  font-weight: 400;
  letter-spacing: -0.64px;
  color: #000000;
`;
const InputLabel = styled.span`
  font-size: 12px;
  font-weight: 400;
  letter-spacing: -0.48px;
  color: #0093f6;
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
