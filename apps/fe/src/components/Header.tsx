import styled from '@emotion/styled';
import Link from 'next/link';
import React from 'react';

interface HeaderProps {
  variant?: 'home' | 'default';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'default' }) => {
  const isHome = variant === 'home';

  return (
    <StyledHeader $isHome={isHome}>
      <HeaderContent $isHome={isHome}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <LogoGroup>
            <HeaderLogoBlur src="/assets/logo.png" alt="" />
            <HeaderLogo src="/assets/logo.png" alt="Pagemate" />
            <PagemateText src="/assets/pagemate-text.svg" alt="Pagemate" />
          </LogoGroup>
        </Link>
      </HeaderContent>
    </StyledHeader>
  );
};

const StyledHeader = styled.header<{ $isHome: boolean }>`
  ${props => props.$isHome ? `
    max-width: 1200px;
    width: 100%;
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
  ` : `
    width: 100%;
    background: white;
    position: relative;
  `}
  height: 64px;
  border-bottom: 1px solid #c4e2f1;
  z-index: 100;
`;

const HeaderContent = styled.div<{ $isHome: boolean }>`
  height: 64px;
  padding: 0 ${props => props.$isHome ? '8px' : '24px'};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  ${props => !props.$isHome && `
    max-width: 1464px;
    margin: 0 auto;
  `}
`;

const LogoGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
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