import styled from '@emotion/styled';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Header } from '@/components/Header';
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
      <Header />

      <Content>
        <PageHeader>
          <PageTitle>Customers</PageTitle>
          <PageDescription>
            Manage your customers and their documents
          </PageDescription>
        </PageHeader>

        {error ? (
          <ErrorContainer>
            <ErrorMessage>{error}</ErrorMessage>
            <RetryButton onClick={loadTenants}>Retry</RetryButton>
          </ErrorContainer>
        ) : loading ? (
          <EmptyState>Loading customers...</EmptyState>
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
          <TenantsGrid>
            {tenants.map((tenant) => (
              <TenantCard key={tenant._id}>
                <TenantHeader>
                  <TenantIcon>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9v.01M9 12v.01M9 15v.01M9 18v.01"
                        stroke="#0093f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </TenantIcon>
                  <TenantInfo>
                    <TenantName>{tenant.name}</TenantName>
                    <TenantMeta>
                      Created {formatDate(tenant.created_at)}
                    </TenantMeta>
                  </TenantInfo>
                </TenantHeader>

                <TenantActions>
                  <Link href={`/customer/${tenant._id}`} passHref>
                    <ActionButton $primary>View Customer</ActionButton>
                  </Link>
                </TenantActions>
              </TenantCard>
            ))}
          </TenantsGrid>
        )}
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  padding: 0 20px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
`;

const ErrorMessage = styled.div`
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

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 104px 0 40px;
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
`;

const PageTitle = styled.h1`
  font-size: 36px;
  font-weight: 600;
  letter-spacing: -1.44px;
  color: #0b3668;
  margin: 0 0 8px 0;
`;

const PageDescription = styled.p`
  font-size: 18px;
  font-weight: 400;
  letter-spacing: -0.72px;
  color: #6c8bab;
  margin: 0;
`;

const TenantsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const TenantCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e1f0f7;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(106, 219, 255, 0.15);
    transform: translateY(-2px);
  }
`;

const TenantHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
`;

const TenantIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #e8f7ff 0%, #c4e2f1 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const TenantInfo = styled.div`
  flex: 1;
`;

const TenantName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.8px;
  color: #0b3668;
  margin: 0 0 4px 0;
`;

const TenantMeta = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #6c8bab;
  margin: 0;
`;

const TenantActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.a<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  background: ${(props) => (props.$primary ? '#0093f6' : 'white')};
  color: ${(props) => (props.$primary ? 'white' : '#0093f6')};
  border: 1px solid ${(props) => (props.$primary ? '#0093f6' : '#c4e2f1')};
  border-radius: 8px;

  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$primary ? '#0073ff' : '#f0f9ff')};
    border-color: ${(props) => (props.$primary ? '#0073ff' : '#0093f6')};
  }
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

export default CustomersPage;
