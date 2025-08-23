import styled from '@emotion/styled';
import Link from 'next/link';
import React from 'react';

export const Header: React.FC = () => {
  return (
    <StyledHeader>
      <HeaderContent>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <HeaderLogo src="/assets/full-logo.png" alt="Pagemate" />
        </Link>
      </HeaderContent>
    </StyledHeader>
  );
};

const StyledHeader = styled.header`
  width: 100%;
  height: 64px;
  z-index: 100;

  position: fixed;
  left: 0;
  top: 0;

  background: rgba(232, 247, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #c4e2f1;

  padding: 0 20px;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const HeaderLogo = styled.img`
  margin-left: -18px;
  margin-bottom: -6px;

  width: 173px;
  min-width: 173px;
  height: 50px;
  min-height: 50px;
  object-fit: cover;
`;
