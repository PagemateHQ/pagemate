import styled from '@emotion/styled';
import React from 'react';

import { FloatingOrb } from '@/pagemate/FloatingOrb';

const HomePage = () => {
  return (
    <Container>
      <Header>
        <HeaderContent>
          <LogoGroup>
            <HeaderLogoBlur src="/assets/logo.png" alt="" />
            <HeaderLogo src="/assets/logo.png" alt="Pagemate" />
            <PagemateText src="/assets/pagemate-text.svg" alt="Pagemate" />
          </LogoGroup>
        </HeaderContent>
      </Header>

      <FloatingOrb />

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
              all through a simple drop-in SDK that turns any flow into
              one-click experiences.
            </Description>
            <ButtonGroup>
              <StartBuildingButton>Start Building</StartBuildingButton>
              <ReadDocsButton>Read Docs</ReadDocsButton>
            </ButtonGroup>
          </HeroContent>
        </HeroSection>

        <DemoSection>
          <DemoLabel>DEMO</DemoLabel>
          <DemoGrid>
            <DemoCard>
              <BrowserWindow>
                <BrowserHeader>
                  <BrowserDots src="/assets/browser-dots.svg" alt="" />
                </BrowserHeader>
                <BrowserContent>
                  <DemoPreview />
                </BrowserContent>
              </BrowserWindow>
              <DemoCardTitle>Commerce</DemoCardTitle>
            </DemoCard>

            <DemoCard>
              <BrowserWindow>
                <BrowserHeader>
                  <BrowserDots src="/assets/browser-dots.svg" alt="" />
                </BrowserHeader>
                <BrowserContent>
                  <DemoPreview />
                </BrowserContent>
              </BrowserWindow>
              <DemoCardTitle>Banking & Finance</DemoCardTitle>
            </DemoCard>

            <DemoCard>
              <BrowserWindow>
                <BrowserHeader>
                  <BrowserDots src="/assets/browser-dots.svg" alt="" />
                </BrowserHeader>
                <BrowserContent>
                  <DemoPreview />
                </BrowserContent>
              </BrowserWindow>
              <DemoCardTitle>SaaS Products</DemoCardTitle>
            </DemoCard>
          </DemoGrid>
        </DemoSection>
      </ContentWrapper>
    </Container>
  );
};

export default HomePage;

const Container = styled.div`
  background: #e8f7ff;
  position: relative;
  width: 100%;
  min-height: 100vh;
`;

const ContentWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 105px;
  transform: translateX(-50%);
  width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 80px;
`;

const HeroSection = styled.div`
  width: 100%;
  height: 394px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`;

const LogoSection = styled.div`
  position: relative;
  width: 206px;
  height: 206px;
  margin: 0 auto;
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
  width: 100%;
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
  position: absolute;
  top: 145px;
  left: 50%;
  transform: translateX(-50%);

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

const ReadDocsButton = styled.button`
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
`;

const DemoLabel = styled.div`
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
  background: #e8f7ff;
  border: 1px solid #abdcf6;
  border-radius: 8px;
  overflow: hidden;
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

const DemoPreview = styled.div`
  width: 100%;
  height: 200px;
  background: url('/assets/demo-preview.png') center/106.54% 121.83% no-repeat;
  background-color: #e8f7ff;
  border: 1px solid #abdcf6;
  border-radius: 4px;
`;

const DemoCardTitle = styled.div`
  font-family: 'Instrument Sans', sans-serif;
  font-weight: 500;
  font-size: 20px;
  line-height: 1.208;
  letter-spacing: -0.8px;
  color: #6ab9e1;
`;

const Header = styled.header`
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 1200px;
  height: 64px;
  border-bottom: 1px solid #c4e2f1;
`;

const HeaderContent = styled.div`
  height: 64px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const LogoGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 2px;
`;

const HeaderLogoBlur = styled.img`
  position: absolute;
  left: -3.27px;
  top: 50%;
  transform: translateY(-50%);
  width: 42.968px;
  height: 42.968px;
  filter: blur(4.655px);
  opacity: 0.47;
`;

const HeaderLogo = styled.img`
  width: 37px;
  height: 37px;
  position: relative;
  z-index: 1;
`;

const PagemateText = styled.img`
  width: 92.269px;
  height: 25.12px;
  position: relative;
  z-index: 1;
`;
