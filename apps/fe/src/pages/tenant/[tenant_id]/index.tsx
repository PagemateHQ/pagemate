import { useRouter } from 'next/router';
import React from 'react';

const TenantPage: React.FC = () => {
  const router = useRouter();
  const { tenant_id } = router.query;

  return (
    <div style={{ padding: '24px' }}>
      <h1>Tenant: {tenant_id}</h1>
      <p>This is the tenant page for tenant ID: {tenant_id}</p>
    </div>
  );
};

export default TenantPage;