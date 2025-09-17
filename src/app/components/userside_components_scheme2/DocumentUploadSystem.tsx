'use client';

import React, { useState } from 'react';
import DocumentUpload from './DocumentsUpload';
import PreviewDocuments from './PreviewDocuments';

import type { DocumentItem, ExtractedData } from '@/app/types/DocumentTypes';

const DocumentUploadSystem: React.FC = () => {
  const [currentView, setCurrentView] = useState<'upload' | 'preview'>('upload');
  const [previewData, setPreviewData] = useState<{
    extractedData: ExtractedData;
    documents: DocumentItem[];
  } | null>(null);

  const handlePreview = (extractedData: ExtractedData, documents: DocumentItem[]) => {
    setPreviewData({ extractedData, documents });
    setCurrentView('preview');
  };

  const handleBackToUpload = () => setCurrentView('upload');

  if (currentView === 'preview' && previewData) {
    return (
      <PreviewDocuments
        extractedData={previewData.extractedData}
        documents={previewData.documents}
        onBack={handleBackToUpload}
      />
    );
  }

  return <DocumentUpload onPreview={handlePreview} />;
};

export default DocumentUploadSystem;
