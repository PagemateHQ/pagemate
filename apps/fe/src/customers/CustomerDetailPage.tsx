import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Header } from '@/components/Header';
import { FileIcon } from '@/components/icons/FileIcon';
import { Document, Tenant, tenantService } from '@/services/api';

const CustomerDetailPage: React.FC = () => {
  const router = useRouter();
  const { customer_id } = router.query;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Fetch tenant and documents
  useEffect(() => {
    if (customer_id && typeof customer_id === 'string') {
      loadData(customer_id);
    }
  }, [customer_id]);

  const loadData = async (tenantId: string) => {
    try {
      setLoading(true);
      const [tenantData, documentsData] = await Promise.all([
        tenantService.getTenant(tenantId),
        tenantService.listDocuments(tenantId),
      ]);
      setTenant(tenantData);
      setDocuments(documentsData);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !customer_id || typeof customer_id !== 'string') return;

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map((file) =>
        tenantService.createDocument(customer_id, file),
      );

      const newDocuments = await Promise.all(uploadPromises);
      setDocuments((prev) => [...newDocuments, ...prev]);
    } catch (err) {
      setError('Failed to upload files');
      console.error('Error uploading files:', err);
    } finally {
      setUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [customer_id],
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string) => {
    const extension = filename.split('.').pop() || '';
    if (extension === 'pdf') return 'pdf';
    if (extension === 'txt') return 'txt';
    if (extension === 'md') return 'md';
    return 'unknown';
  };

  return (
    <Container>
      <Header />

      <Content>
        <Sidebar>
          <TenantCard>
            {loading ? (
              <LoadingText>Loading...</LoadingText>
            ) : (
              <>
                <TenantHeader>
                  <TenantLogo
                    src="/app/logo-acme-insurance.png"
                    alt="Acme Insurance"
                  />
                  <Divider />
                </TenantHeader>
                <TenantInfo>
                  <TenantDetails>
                    <TenantCategory>Insurance & Finance</TenantCategory>
                    <TenantName>{tenant?.name || 'Acme Insurance'}</TenantName>
                    <TenantCreated>Created Aug 23, 2025</TenantCreated>
                  </TenantDetails>
                </TenantInfo>
              </>
            )}
          </TenantCard>
        </Sidebar>

        <MainContent>
          <UploadSection
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            $isDragging={dragActive}
          >
            <UploadContent>
              <IconRow>
                <FileIcon type="pdf" />
                <FileIcon type="txt" />
                <FileIcon type="md" />
              </IconRow>

              <UploadTitle>
                Upload Documents
                <br />
                to form your Pagebase™
              </UploadTitle>

              <UploadDescription>
                Teams ingest their documents and playbooks,
                <br />
                Pagemate converts them into executable flows,
                <br />
                and tracks completion and deflection.
              </UploadDescription>
            </UploadContent>

            <DropZone
              $isDragging={dragActive}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                style={{ display: 'none' }}
                onClick={(e) => e.stopPropagation()}
              />
              <DropZoneText>Upload or drag and drop files here</DropZoneText>
            </DropZone>
          </UploadSection>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {uploading && <LoadingMessage>Uploading files...</LoadingMessage>}

          <DocumentsSection>
            <DocumentsHeader>
              <DocumentsTitle>Documents</DocumentsTitle>
              <DocumentsCount>({documents.length})</DocumentsCount>
            </DocumentsHeader>

            <DocumentsList>
              {loading ? (
                <EmptyState>List is loading...</EmptyState>
              ) : documents.length === 0 ? (
                <EmptyState>List is empty</EmptyState>
              ) : (
                documents.map((doc) => (
                  <DocumentCard key={doc._id}>
                    <FileIcon type={getFileExtension(doc.name)} />
                    <DocumentInfo>
                      <DocumentName>{doc.name}</DocumentName>
                      <DocumentMeta>
                        {formatFileSize(doc.size)} •{' '}
                        {new Date(doc.created_at).toLocaleDateString()}
                      </DocumentMeta>
                    </DocumentInfo>
                    <StatusBadge status={doc.embedding_status}>
                      {doc.embedding_status}
                    </StatusBadge>
                  </DocumentCard>
                ))
              )}
            </DocumentsList>
          </DocumentsSection>
        </MainContent>
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
`;

const LoadingText = styled.div`
  font-size: 16px;
  font-weight: 400;
  letter-spacing: -0.64px;
  color: #6c8bab;
`;

const Content = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  display: flex;
  gap: 24px;
  padding: 88px 24px 24px;

  @media screen and (max-width: 1160px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.aside`
  width: 348px;
  flex-shrink: 0;

  @media screen and (max-width: 1160px) {
    width: 100%;
  }
`;

const TenantCard = styled.div`
  width: 100%;
  background: white;
  border-radius: 8px;
  padding: 22px 18px;
  min-height: 210px;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const TenantHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const TenantLogo = styled.img`
  width: 162px;
  height: 58px;
  object-fit: contain;
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: #c4e2f1;
`;

const TenantInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TenantDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const TenantCategory = styled.span`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.42px;
  color: #0093f6;
  font-variation-settings: 'wdth' 100;
`;

const TenantName = styled.h2`
  font-size: 23px;
  font-weight: 500;
  letter-spacing: -0.69px;
  color: #000000;
  margin: 0;
  font-variation-settings: 'wdth' 100;
`;

const TenantCreated = styled.span`
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.56px;
  color: #6c8bab;
  line-height: 1.2;
  font-variation-settings: 'wdth' 100;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const UploadSection = styled.div<{ $isDragging: boolean }>`
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    #eaf8ffb9 50%,
    #bce1f473 100%
  );
  border: 1px solid #abdcf6;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  gap: 16px;
  transition: all 0.2s ease;

  ${(props) =>
    props.$isDragging &&
    `
    border-color: #0093f6;
    box-shadow: 0 0 0 2px rgba(0, 147, 246, 0.2);
  `}
`;

const UploadContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 0 12px;
`;

const IconRow = styled.div`
  display: flex;
  gap: 7px;
`;

const UploadTitle = styled.h3`
  font-size: 24px;
  font-weight: 400;
  line-height: 1.04;
  letter-spacing: -0.96px;
  color: #0b3668;
  text-align: center;
  margin: 0;
`;

const UploadDescription = styled.p`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.56px;
  color: #6c8bab;
  text-align: center;
  margin: 0;
`;

const DropZone = styled.div<{ $isDragging: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #0093f6;
  border-radius: 8px;
  padding: 40px 20px;
  transition: all 0.2s ease;
  cursor: pointer;

  ${(props) =>
    props.$isDragging &&
    `
    background: rgba(0, 147, 246, 0.05);
    border-color: #0073ff;
  `}

  &:hover {
    background: rgba(0, 147, 246, 0.03);
  }
`;

const DropZoneText = styled.p`
  font-size: 16px;
  font-weight: 400;
  letter-spacing: -0.64px;
  color: #0093f6;
  margin: 0;
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c00;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
`;

const LoadingMessage = styled.div`
  background: #e6f4ff;
  color: #0093f6;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
`;

const DocumentsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DocumentsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DocumentsTitle = styled.h3`
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.8px;
  color: #0d386a;
  margin: 0;
`;

const DocumentsCount = styled.span`
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.72px;
  color: #0093f6;
`;

const DocumentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DocumentCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 78px;
`;

const DocumentInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DocumentName = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: #0b3668;
  margin: 0;
`;

const DocumentMeta = styled.span`
  font-size: 14px;
  color: #6c8bab;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) => {
    switch (props.status) {
      case 'completed':
        return '#d4f4dd';
      case 'processing':
        return '#fff4d4';
      case 'failed':
        return '#ffd4d4';
      default:
        return '#e8e8e8';
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'completed':
        return '#00a04a';
      case 'processing':
        return '#ff9500';
      case 'failed':
        return '#ff3b30';
      default:
        return '#666';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c8bab;
  font-size: 16px;
`;

export default CustomerDetailPage;
