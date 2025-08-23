import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import React from 'react';

interface IntroViewProps {
  onClose?: () => void;
  onSendMessage?: (message: string) => void;
  onSwitchToChat?: (initialMessage: string) => void;
  suggestions: string[]; // Required
}

export const IntroView: React.FC<IntroViewProps> = ({
  onSendMessage,
  onSwitchToChat,
  suggestions,
}) => {
  const handleSuggestionClick = (text: string) => {
    if (onSwitchToChat) {
      onSwitchToChat(text);
    } else if (onSendMessage) {
      onSendMessage(text);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0.0, 0.2, 1],
      },
    },
  } as const;

  return (
    <>
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
        {suggestions.map((suggestion, index) => (
          <MotionSuggestionButton
            key={index}
            whileHover={{
              scale: 1.02,
              backgroundColor: 'rgba(171, 220, 246, 0.45)',
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </MotionSuggestionButton>
        ))}
      </MotionSuggestionsContainer>
    </>
  );
};

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

  .blur-layer:nth-of-type(1) {
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

  .blur-layer:nth-of-type(2) {
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

  .blur-layer:nth-of-type(3) {
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

  .blur-layer:nth-of-type(4) {
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

  .blur-layer:nth-of-type(5) {
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

  .blur-layer:nth-of-type(6) {
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

  .blur-layer:nth-of-type(7) {
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

  .blur-layer:nth-of-type(8) {
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

  .blur-layer:nth-of-type(9) {
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

  .blur-layer:nth-of-type(10) {
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

  .blur-layer:nth-of-type(11) {
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

  .blur-layer:nth-of-type(12) {
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
