import styled from '@emotion/styled';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Tenant, tenantService } from '@/services/api';

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
      <Header>
        <HeaderContent>
          <LogoWrapper>
            <LogoContainer>
              <LogoImage src="/logo.png" alt="Pagemate" />
              <LogoText>Pagemate</LogoText>
            </LogoContainer>
          </LogoWrapper>
        </HeaderContent>
      </Header>

      <HeroSection>
        <HeroTitle>Start Building with</HeroTitle>
        <PagemateBadge>
          <BadgeIcon>⚡</BadgeIcon>
          <BadgeText>Pagemate</BadgeText>
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
                    <CompanyLogo src="/logo.png" alt={tenant.name} />
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
                    <Link
                      href={`/customer/${tenant._id}`}
                      passHref
                      legacyBehavior
                    >
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
              <IntegrationSubtitle>Get started in minutes</IntegrationSubtitle>
              <IntegrationTitle>Ready to integrate?</IntegrationTitle>
            </IntegrationHeader>
            <IntegrationContent>
              <IntegrationStep>
                <StepNumber>1</StepNumber>
                <StepContent>
                  <StepTitle>Install the package</StepTitle>
                  <CodeBlock>
                    <CodeHeader>
                      <PackageManager>npm</PackageManager>
                    </CodeHeader>
                    <CodeContent>
                      <CodeText>yarn add @pagemate/sdk</CodeText>
                    </CodeContent>
                  </CodeBlock>
                </StepContent>
              </IntegrationStep>
              <StepConnector />
              <IntegrationStep>
                <StepNumber $active>2</StepNumber>
                <StepContent>
                  <StepTitle $active>Add widget from Pagemate SDK</StepTitle>
                  <CodeBlock>
                    <CodeHeader>
                      <PackageManager>React</PackageManager>
                    </CodeHeader>
                    <CodeContent>
                      <CodeText>
                        {`<Pagemate.FloatingOrb
  initialCorner="bottom-right"
  defaultSuggestions={[
    'What is the Austin Office Phone Number?',
    'Are there any updates on the claim ACM-123456?',
    'Insurance quote for $20k Car and $1M Home in MA',
  ]}
/>`}
                      </CodeText>
                    </CodeContent>
                  </CodeBlock>
                </StepContent>
              </IntegrationStep>
            </IntegrationContent>
          </IntegrationCard>
        </RightSection>
      </MainContent>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #e8f7ff;
`;

const Header = styled.header`
  position: relative;
  height: 64px;
  background: transparent;
  border-bottom: 1px solid #c4e2f1;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 8px;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LogoImage = styled.img`
  width: 37px;
  height: 37px;
`;

const LogoText = styled.span`
  font-size: 20px;
  font-weight: 600;
  color: #0b3668;
  letter-spacing: -0.4px;
`;

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 51px 0 48px;
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 400;
  color: #0b3668;
  letter-spacing: -1.92px;
  line-height: 1.04;
  margin: 0;
`;

const PagemateBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #bae3f8;
  border-radius: 221px;
  padding: 4.4px 17.7px;
`;

const BadgeIcon = styled.span`
  font-size: 32px;
`;

const BadgeText = styled.span`
  font-size: 36px;
  font-weight: 600;
  color: #0b3668;
  letter-spacing: -0.72px;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 24px;
  padding: 0 20px 40px;
`;

const LeftSection = styled.div`
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
  margin: 0;
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

const CompanyCategory = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #0093f6;
  letter-spacing: -0.42px;
`;

const CompanyName = styled.span`
  font-size: 23px;
  font-weight: 500;
  color: #000000;
  letter-spacing: -0.69px;
`;

const CompanyCreated = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #6c8bab;
  letter-spacing: -0.56px;
  line-height: 1.2;
`;

const ViewDetailsButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: 1px solid #c4e2f1;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6ab9e1;
  letter-spacing: -0.56px;
  line-height: 1.208;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f9ff;
    border-color: #0093f6;
  }
`;

const VerticalDivider = styled.div`
  width: 1px;
  background: #c4e2f1;
  align-self: stretch;
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
  padding: 40px;
  border-bottom: 1px solid #c4e2f1;
  text-align: center;
  position: relative;
  background: rgba(170, 226, 255, 0.1);
`;

const IntegrationSubtitle = styled.div`
  font-size: 18px;
  font-weight: 400;
  color: #0093f6;
  letter-spacing: -0.72px;
  line-height: 1.04;
  margin-bottom: 8px;
`;

const IntegrationTitle = styled.h3`
  font-size: 34px;
  font-weight: 500;
  color: #0b3668;
  letter-spacing: -1.36px;
  line-height: 1.04;
  margin: 0;
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

const StepNumber = styled.div<{ $active?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid ${(props) => (props.$active ? '#0b3668' : '#6c8bab')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: ${(props) => (props.$active ? '#0b3668' : '#6c8bab')};
  letter-spacing: -0.52px;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 13px;
`;

const StepTitle = styled.div<{ $active?: boolean }>`
  font-size: 18px;
  font-weight: 400;
  color: ${(props) => (props.$active ? '#0b3668' : '#6c8bab')};
  letter-spacing: -0.72px;
  line-height: 1.04;
`;

const CodeBlock = styled.div`
  background: #1b3452;
  border: 1px solid #506988;
  border-radius: 8px;
  overflow: hidden;
`;

const CodeHeader = styled.div`
  padding: 12px 20px;
  border-bottom: 1px solid #506988;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PackageManager = styled.div`
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
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  letter-spacing: -0.42px;
  line-height: 1.04;
  margin: 0;
  white-space: pre-wrap;
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

const LoadingState = styled.div`
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
  margin: 0;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
`;

const ErrorMessage = styled.span`
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
