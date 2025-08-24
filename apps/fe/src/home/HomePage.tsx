import styled from '@emotion/styled';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';

import { Header } from '@/components/Header';

const DEMO_ITEMS: {
  title: string;
  image: string;
}[] = [
  {
    title: 'Banking & Finance',
    image: '/assets/demo-bank.png',
  },
  {
    title: 'Insurance',
    image: '/assets/demo-insurance.png',
  },
  {
    title: 'Government Services',
    image: '/assets/demo-government.png',
  },
];

const HomePage = () => {
  return (
    <Container>
      <Header />

      <ContentWrapper>
        <HeroSection>
          <LogoSection>
            <LogoBlur src="/assets/logo.png" alt="" />
            <Logo src="/assets/logo.png" alt="Pagemate" />
            <LogoGradient />
          </LogoSection>
          <HeroContent>
            <Title>
              User flows shouldn't
              <br />
              require support tickets.
            </Title>
            <Description>
              Pagemate guides users and executes tasks for them—
              <br />
              all through a simple drop-in SDK{' '}
              <span className="inline-block">
                that turns any flow into one-click experiences.
              </span>
            </Description>
            <ButtonGroup>
              <Link href="/customers" style={{ textDecoration: 'none' }}>
                <StartBuildingButton>Start Building</StartBuildingButton>
              </Link>
              <Link href="https://insurance.pagemate.app">
                <DemoButton>Demo</DemoButton>
              </Link>
            </ButtonGroup>
          </HeroContent>
        </HeroSection>

        {/* Scenario explanation section */}
        <ScenarioSection>
          <DemoLabel>SCENARIO</DemoLabel>
          <ScenarioGrid>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <ScenarioColumn>
                <BubbleLabel>User says</BubbleLabel>
                <ChatBubbleLeft>
                  I cannot find this feature!
                </ChatBubbleLeft>
              </ScenarioColumn>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            >
              <ScenarioCenter>
                <CalloutWrapper>
                  <HelpCallout>Pagemate is here to help!</HelpCallout>
                  <TightLogo src="/assets/logo.png" alt="Pagemate" />
                </CalloutWrapper>
              </ScenarioCenter>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            >
              <ScenarioColumn alignRight>
                <BubbleLabel>Company says</BubbleLabel>
                <ChatBubbleRight>
                  How can you not find it?!?
                </ChatBubbleRight>
              </ScenarioColumn>
            </motion.div>
          </ScenarioGrid>
        </ScenarioSection>

        <DemoSection>
          <DemoLabel>USAGE</DemoLabel>
          <DemoGrid>
            {DEMO_ITEMS.map((item) => (
              <DemoCard key={item.title}>
                <BrowserWindow>
                  <BrowserHeader>
                    <BrowserDots src="/assets/browser-dots.svg" alt="" />
                  </BrowserHeader>
                  <BrowserContent>
                    <DemoPreviewBorderProvider>
                      <DemoPreview
                        src={item.image}
                        alt=""
                        width={600}
                        height={320}
                      />
                    </DemoPreviewBorderProvider>
                  </BrowserContent>
                </BrowserWindow>
                <DemoCardTitle>{item.title}</DemoCardTitle>
              </DemoCard>
            ))}
          </DemoGrid>
        </DemoSection>
      </ContentWrapper>
    </Container>
  );
};

export default HomePage;

const Container = styled.div`
  padding: 0 20px;
  width: 100%;
  min-height: 100vh;
  position: relative;
`;

const ContentWrapper = styled.div`
  padding-top: 105px;
  padding-bottom: 120px;
  margin: 0 auto;

  max-width: 1200px;
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 80px;
`;

const HeroSection = styled.div`
  width: 100%;
  height: 394px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoSection = styled.div`
  position: relative;
  width: 206px;
  height: 206px;
  min-height: 206px;
`;

const LogoBlur = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  width: 206px;
  height: 206px;
  filter: blur(22.317px);
  opacity: 0.47;
`;

const Logo = styled.img`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 178px;
  height: 178px;
`;

const LogoGradient = styled.div`
  position: absolute;
  width: 206px;
  height: 120px;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(232, 247, 255, 0) 0%,
    #e8f7ff 100%
  );
`;

const HeroContent = styled.div`
  margin-top: -61px;
  z-index: 1;

  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-family: 'Instrument Sans', sans-serif;
  font-weight: 400;
  font-size: 48px;
  line-height: 1.04;
  letter-spacing: -1.92px;
  color: #0b3668;
  text-align: center;

  @media screen and (max-width: 500px) {
    font-size: 40px;
  }
`;

const Description = styled.p`
  margin-top: 28px;

  font-family: 'Instrument Sans', sans-serif;
  font-weight: 400;
  font-size: 18px;
  line-height: 1.4;
  letter-spacing: -0.72px;
  color: #6c8bab;
  text-align: center;

  @media screen and (max-width: 500px) {
    margin-top: 16px;
    font-size: 16px;
  }
`;

const ButtonGroup = styled.div`
  margin-top: 24px;

  display: flex;
  gap: 8px;
  align-items: center;
`;

const StartBuildingButton = styled.button`
  padding: 13px 28px;
  background: linear-gradient(180deg, #eef9ff 29.327%, #cdeeff 100%);
  border: 1px solid #c4e2f1;
  border-radius: 8px;
  box-shadow: 0px 10px 22px 0px rgba(64, 156, 203, 0.3);
  font-family: 'Instrument Sans', sans-serif;
  font-weight: 500;
  font-size: 17px;
  line-height: 1.208;
  letter-spacing: -0.68px;
  color: #59b3e1;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0px 12px 24px 0px rgba(64, 156, 203, 0.35);
  }
`;

const DemoButton = styled.button`
  padding: 13px 28px;
  background: transparent;
  border: 1px solid #c4e2f1;
  border-radius: 8px;
  font-family: 'Instrument Sans', sans-serif;
  font-weight: 500;
  font-size: 17px;
  line-height: 1.208;
  letter-spacing: -0.68px;
  color: #6ab9e1;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(196, 226, 241, 0.1);
  }
`;

const DemoSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media screen and (max-width: 700px) {
    margin-top: 64px;
  }

  @media screen and (max-width: 400px) {
    margin-top: 100px;
  }
`;

const ScenarioSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media screen and (max-width: 700px) {
    margin-top: 24px;
  }
`;

const ScenarioGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: stretch;
`;

const ScenarioColumn = styled.div<{ alignRight?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(p) => (p.alignRight ? 'flex-end' : 'flex-start')};
  gap: 12px;
  width: 100%;
`;

const BubbleLabel = styled.span`
  font-family: 'Instrument Sans', sans-serif;
  font-weight: 600;
  font-size: 18px;
  letter-spacing: -0.4px;
  color: #6c8bab;
`;

const ChatBubbleBase = styled.div`
  position: relative;
  width: fit-content;
  max-width: 860px;
  padding: 22px 26px;
  background: #ffffff;
  border: 1px solid #c4e2f1;
  border-radius: 16px;
  box-shadow: 0px 14px 32px rgba(64, 156, 203, 0.2);

  font-family: 'Instrument Sans', sans-serif;
  font-size: 24px;
  line-height: 1.5;
  letter-spacing: -0.48px;
  color: #0b3668;

  @media screen and (max-width: 900px) {
    max-width: 100%;
  }

  @media screen and (max-width: 500px) {
    font-size: 18px;
    padding: 18px 22px;
  }
`;

const ChatBubbleLeft = styled(ChatBubbleBase)`
  &:after {
    content: '';
    position: absolute;
    left: -12px;
    top: 28px;
    width: 0;
    height: 0;
    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    border-right: 12px solid #ffffff;
  }

  &:before {
    content: '';
    position: absolute;
    left: -13px;
    top: 28px;
    width: 0;
    height: 0;
    border-top: 13px solid transparent;
    border-bottom: 13px solid transparent;
    border-right: 13px solid #c4e2f1;
  }
`;

const ChatBubbleRight = styled(ChatBubbleBase)`
  &:after {
    content: '';
    position: absolute;
    right: -12px;
    top: 28px;
    width: 0;
    height: 0;
    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    border-left: 12px solid #ffffff;
  }

  &:before {
    content: '';
    position: absolute;
    right: -13px;
    top: 28px;
    width: 0;
    height: 0;
    border-top: 13px solid transparent;
    border-bottom: 13px solid transparent;
    border-left: 13px solid #c4e2f1;
  }
`;

const ScenarioCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const CalloutWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const TightLogo = styled.img`
  position: absolute;
  top: -14px;
  right: -14px;
  width: 40px;
  height: 40px;
  /* No background, border, or shadow for a clean look */

  @media screen and (max-width: 500px) {
    width: 32px;
    height: 32px;
    top: -10px;
    right: -10px;
  }
`;

const HelpCallout = styled.div`
  padding: 22px 30px;
  background: linear-gradient(180deg, #eef9ff 29.327%, #cdeeff 100%);
  border: 1px solid #c4e2f1;
  border-radius: 999px;
  box-shadow: 0px 14px 28px 0px rgba(64, 156, 203, 0.28);

  font-family: 'Instrument Sans', sans-serif;
  font-weight: 700;
  font-size: 28px;
  letter-spacing: -0.56px;
  color: #59b3e1;
  text-align: center;

  /* Allow wrapping on small screens to avoid overflow */
  max-width: 100%;
  white-space: normal;

  @media screen and (max-width: 500px) {
    font-size: 22px;
    padding: 18px 24px;
  }
`;

const DemoLabel = styled.span`
  font-family: 'Instrument Sans', sans-serif;
  font-weight: 500;
  font-size: 20px;
  line-height: 1.208;
  letter-spacing: -0.8px;
  color: #6ab9e1;
`;

const DemoGrid = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;

  @media screen and (max-width: 900px) {
    max-width: 600px;
    margin: 0 auto;

    flex-direction: column;
    gap: 32px;
  }
`;

const DemoCard = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

const BrowserWindow = styled.div`
  width: 100%;
  border: 1px solid #abdcf6;
  border-radius: 8px;
  overflow: hidden;

  border: 1px solid transparent;
  background:
    linear-gradient(#e8f7ff, #e8f7ff) padding-box,
    linear-gradient(180deg, #abdcf6 0%, rgba(106, 185, 225, 0.15) 100%)
      border-box;
`;

const BrowserHeader = styled.div`
  height: 20px;
  background: #e8f7ff;
  border-bottom: 1px solid #afdef6;
  display: flex;
  align-items: center;
  padding: 0 8px;
`;

const BrowserDots = styled.img`
  width: 20px;
  height: 4px;
`;

const BrowserContent = styled.div`
  padding: 8px;
`;

const DemoPreviewBorderProvider = styled.div`
  width: 100%;
  height: fit-content;
  overflow: hidden;
  border-radius: 4px;

  border: 1px solid transparent;
  background:
    linear-gradient(#e8f7ff, #e8f7ff) padding-box,
    linear-gradient(180deg, #abdcf6 0%, #dbf3ff 100%) border-box;
`;
const DemoPreview = styled(Image)`
  width: 100%;
  background-color: #e8f7ff;
`;

const DemoCardTitle = styled.span`
  font-family: 'Instrument Sans', sans-serif;
  font-weight: 500;
  font-size: 20px;
  line-height: 1.208;
  letter-spacing: -0.8px;
  color: #6ab9e1;
`;
