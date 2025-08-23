import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Header } from '@/components/Header';
import { Tenant, tenantService } from '@/services/api';

const NpmIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.2002 16.1997H1.7998V1.80029H16.2002V16.1997ZM3.34668 14.6528H8.95117V6.19775H11.8018V14.6528H14.6533V3.34717H3.34668V14.6528Z"
      fill="#BAE3F8"
    />
  </svg>
);

const ReactIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_23_2271)">
      <path
        d="M8.99964 10.6322C9.90338 10.6322 10.636 9.8996 10.636 8.99586C10.636 8.09212 9.90338 7.3595 8.99964 7.3595C8.09591 7.3595 7.36328 8.09212 7.36328 8.99586C7.36328 9.8996 8.09591 10.6322 8.99964 10.6322Z"
        fill="#BAE3F8"
      />
      <path
        d="M9.00018 12.6777C13.5189 12.6777 17.182 11.0293 17.182 8.99591C17.182 6.96249 13.5189 5.31409 9.00018 5.31409C4.48148 5.31409 0.818359 6.96249 0.818359 8.99591C0.818359 11.0293 4.48148 12.6777 9.00018 12.6777Z"
        stroke="#BAE3F8"
        strokeWidth="0.818182"
      />
      <path
        d="M5.81147 10.8368C8.07082 14.7501 11.3299 17.0983 13.0909 16.0816C14.8519 15.0649 14.4479 11.0683 12.1886 7.155C9.92922 3.24169 6.67009 0.893539 4.90911 1.91025C3.14812 2.92695 3.55212 6.92351 5.81147 10.8368Z"
        stroke="#BAE3F8"
        strokeWidth="0.818182"
      />
      <path
        d="M5.81129 7.15494C3.55194 11.0682 3.14794 15.0648 4.90893 16.0815C6.66992 17.0982 9.92904 14.7501 12.1884 10.8368C14.4477 6.92346 14.8517 2.9269 13.0907 1.91019C11.3298 0.893483 8.07064 3.24164 5.81129 7.15494Z"
        stroke="#BAE3F8"
        strokeWidth="0.818182"
      />
    </g>
    <defs>
      <clipPath id="clip0_23_2271">
        <rect
          width="18"
          height="16.5845"
          fill="white"
          transform="translate(0 0.707764)"
        />
      </clipPath>
    </defs>
  </svg>
);

const CustomersPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantService.listTenants();
      setTenants(data);
    } catch (err) {
      setError('Failed to load tenants');
      console.error('Error loading tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container>
      <Header />

      <Content>
        <HeroSection>
          <HeroTitle>
            Start Building with <span className="sr-only">Pagemate</span>
          </HeroTitle>
          <PagemateBadge>
            <PagemateBadgeLogo
              src="/app/logo-pagemate-tight.png"
              alt="Pagemate"
            />
          </PagemateBadge>
        </HeroSection>

        <MainContent>
          <LeftSection>
            <SectionHeader>
              <SectionTitle>Customers</SectionTitle>
              <SectionCount>({tenants.length})</SectionCount>
            </SectionHeader>

            {error ? (
              <ErrorContainer>
                <ErrorMessage>{error}</ErrorMessage>
                <RetryButton onClick={loadTenants}>Retry</RetryButton>
              </ErrorContainer>
            ) : loading ? (
              <LoadingState>Loading customers...</LoadingState>
            ) : tenants.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon>
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9v.01M9 12v.01M9 15v.01M9 18v.01"
                      stroke="#6c8bab"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </EmptyStateIcon>
                <EmptyStateTitle>No customers yet</EmptyStateTitle>
                <EmptyStateDescription>
                  Create your first customer to get started
                </EmptyStateDescription>
              </EmptyState>
            ) : (
              <CustomerGrid>
                {tenants.map((tenant) => (
                  <CustomerCard key={tenant._id}>
                    <CardContent>
                      <CompanyLogo
                        src="/app/logo-acme-insurance.png"
                        alt={tenant.name}
                      />
                      <Divider />
                    </CardContent>
                    <CompanyDetails>
                      <CompanyInfo>
                        <CompanyCategory>Insurance & Finance</CompanyCategory>
                        <CompanyName>{tenant.name}</CompanyName>
                        <CompanyCreated>
                          Created {formatDate(tenant.created_at)}
                        </CompanyCreated>
                      </CompanyInfo>
                      <Link href={`/customer/${tenant._id}`}>
                        <ViewDetailsButton>View Details</ViewDetailsButton>
                      </Link>
                    </CompanyDetails>
                  </CustomerCard>
                ))}
              </CustomerGrid>
            )}
          </LeftSection>

          <VerticalDivider />

          <RightSection>
            <IntegrationCard>
              <IntegrationHeader>
                <IntegrationSubtitle>
                  Get started in minutes
                </IntegrationSubtitle>
                <IntegrationTitle>Ready to integrate?</IntegrationTitle>

                <IntergrationBlur src="/assets/intro-bottom-blur.png" alt="" />
              </IntegrationHeader>
              <IntegrationContent>
                <IntegrationStep>
                  <StepNumber>
                    <span>1</span>
                  </StepNumber>
                  <StepContent>
                    <StepTitle>Install the package</StepTitle>
                    <CodeBlock $bgImage="/app/bg-terminal-1.png">
                      <CodeHeader>
                        <PackageManager>
                          <NpmIcon />
                          npm
                        </PackageManager>
                      </CodeHeader>
                      <CodeContent>
                        <CodeText>
                          <code>yarn add @pagemate/sdk</code>
                        </CodeText>
                      </CodeContent>
                    </CodeBlock>
                  </StepContent>
                </IntegrationStep>
                <IntegrationStep>
                  <StepNumber>
                    <span>2</span>
                  </StepNumber>
                  <StepContent>
                    <StepTitle>Add widget from Pagemate SDK</StepTitle>
                    <CodeBlock $bgImage="/app/bg-terminal-2.png">
                      <CodeHeader>
                        <PackageManager>
                          <ReactIcon />
                          React
                        </PackageManager>
                      </CodeHeader>
                      <CodeContent>
                        <CodeText>
                          <code>
                            {`<Pagemate.FloatingOrb
  initialCorner="bottom-right"
  defaultSuggestions={[
    'What is the Austin Office Phone Number?',
    'Are there any updates on the claim ACM-123456?',
    'Insurance quote for $20k Car and $1M Home in MA',
  ]}
/>`}
                          </code>
                        </CodeText>
                      </CodeContent>
                    </CodeBlock>
                  </StepContent>
                </IntegrationStep>
              </IntegrationContent>
            </IntegrationCard>
          </RightSection>
        </MainContent>
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  padding: 0 20px;
  width: 100%;
`;
const Content = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  display: flex;
  flex-direction: column;
  gap: 64px;
  padding: 115px 0 120px;
`;

const HeroSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;
const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 400;
  color: #0b3668;
  letter-spacing: -1.92px;
  line-height: 1.04;
  text-align: center;
`;
const PagemateBadge = styled.div`
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #bae3f8;
  border-radius: 221px;
  padding: 5px 18px;
`;
const PagemateBadgeLogo = styled.img`
  width: 247px;
  height: 55px;
  object-fit: contain;
`;

const MainContent = styled.div`
  width: 100%;
  display: flex;
  gap: 24px;

  @media screen and (max-width: 1160px) {
    flex-direction: column;
  }
`;

const LeftSection = styled.div`
  max-width: 532px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
`;
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 500;
  color: #0d386a;
  letter-spacing: -0.8px;
  line-height: 1.208;
`;
const SectionCount = styled.span`
  font-size: 18px;
  font-weight: 500;
  color: #0093f6;
  letter-spacing: -0.72px;
  line-height: 1.208;
`;

const CustomerGrid = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const CustomerCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 22px 18px;
  width: 258px;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CompanyLogo = styled.img`
  width: 162px;
  height: 58px;
  object-fit: contain;
`;

const Divider = styled.div`
  height: 1px;
  background: #c4e2f1;
  width: 100%;
`;

const CompanyDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const CompanyCategory = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #0093f6;
  letter-spacing: -0.42px;
`;

const CompanyName = styled.h3`
  font-size: 23px;
  font-weight: 500;
  color: #000000;
  letter-spacing: -0.69px;
`;

const CompanyCreated = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #6c8bab;
  letter-spacing: -0.56px;
  line-height: 1.2;
`;

const ViewDetailsButton = styled.button`
  display: flex;
  padding: 8px 16px;
  justify-content: center;
  align-items: center;

  border-radius: 8px;
  border: 1px solid #c4e2f1;

  color: #6ab9e1;
  font-size: 14px;
  font-weight: 500;
  line-height: 120.817%; /* 16.914px */
  letter-spacing: -0.56px;

  &:hover {
    background: rgba(196, 226, 241, 0.1);
  }
`;

const VerticalDivider = styled.div`
  width: 1px;
  background: #c4e2f1;
  align-self: stretch;

  @media screen and (max-width: 1160px) {
    width: 100%;
    height: 1px;
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const IntegrationCard = styled.div`
  background: rgba(72, 132, 204, 0.11);
  border-radius: 8px;
  overflow: hidden;
`;

const IntegrationHeader = styled.div`
  padding: 36px 20px;
  border-bottom: 1px solid #c4e2f1;
  text-align: center;
  background: rgba(170, 226, 255, 0.1);

  position: relative;
  z-index: 0;
`;
const IntegrationSubtitle = styled.p`
  font-size: 18px;
  font-weight: 400;
  color: #0093f6;
  letter-spacing: -0.72px;
  line-height: 1.04;
  margin: 0 0 8px 0;
`;
const IntegrationTitle = styled.h3`
  font-size: 34px;
  font-weight: 500;
  color: #0b3668;
  letter-spacing: -1.36px;
  line-height: 1.04;
`;
const IntergrationBlur = styled.img`
  width: 377px;
  height: 212px;

  object-fit: contain;
  object-position: bottom center;

  position: absolute;
  left: 50%;
  bottom: -1px;
  transform: translateX(-50%);
  z-index: -1;

  opacity: 0.6;
`;

const IntegrationContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
`;

const IntegrationStep = styled.div`
  display: flex;
  gap: 12px;
`;
const StepNumber = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid #0b3668;
  display: flex;
  align-items: center;
  justify-content: center;

  padding-right: 1px;

  & > span {
    font-size: 12px;
    font-weight: 600;
    color: #0b3668;
    letter-spacing: -0.52px;
    flex-shrink: 0;
  }
`;

const StepContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 13px;
`;

const StepTitle = styled.p`
  font-size: 18px;
  font-weight: 400;
  color: #0b3668;
  letter-spacing: -0.4px;
  line-height: 1.04;
`;

const CodeBlock = styled.div<{ $bgImage?: string }>`
  background: #1b3452;
  border: 1px solid #506988;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  z-index: 0;

  ${(props) =>
    props.$bgImage &&
    css`
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url('${props.$bgImage}');
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        z-index: -1;
      }

      > * {
        position: relative;
        z-index: 1;
      }
    `}
`;

const CodeHeader = styled.div`
  padding: 10px;
  border-bottom: 1px solid #506988;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PackageManager = styled.span`
  background: #2d4e77;
  border-radius: 6px;
  padding: 3px 6px 3px 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 400;
  color: #bae3f8;
  letter-spacing: -0.56px;
`;

const CodeContent = styled.div`
  padding: 18px 16px;
`;

const CodeText = styled.pre`
  font-size: 12.8px;
  font-weight: 500;
  color: #d5e0eb;
  letter-spacing: -0.1px;
  line-height: 1.4;
  white-space: pre-wrap;

  & > code {
    font-family:
      ui-monospace, Menlo, Monaco, 'Cascadia Mono', 'Segoe UI Mono',
      'Roboto Mono', 'Oxygen Mono', 'Ubuntu Mono', 'Source Code Pro',
      'Fira Mono', 'Droid Sans Mono', 'Consolas', 'Courier New', monospace !important;
  }
`;

const StepConnector = styled.div`
  position: absolute;
  left: 30px;
  top: 60px;
  width: 1px;
  height: 133px;
  background: linear-gradient(180deg, #6c8bab 0%, #c4e2f1 100%);
  transform: rotate(90deg);
  transform-origin: top left;

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: -2px;
    width: 0;
    height: 0;
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    border-top: 6px solid #c4e2f1;
  }
`;

const LoadingState = styled.p`
  padding: 40px;
  text-align: center;
  font-size: 16px;
  color: #6c8bab;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
`;

const EmptyStateTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.96px;
  color: #0b3668;
  margin: 0 0 8px 0;
`;

const EmptyStateDescription = styled.p`
  font-size: 16px;
  font-weight: 400;
  letter-spacing: -0.64px;
  color: #6c8bab;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
`;

const ErrorMessage = styled.p`
  font-size: 18px;
  color: #ff3b30;
`;

const RetryButton = styled.button`
  padding: 10px 24px;
  background: #0093f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #0073ff;
  }
`;

export default CustomersPage;
