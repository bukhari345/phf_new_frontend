/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export interface DocumentItem {
  id: string;
  name: string;
  description: string;
  instructions?: string[];
  icon: React.ReactNode;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  progress: number;
  file?: File;
  sectionType?: string;
  apiEndpoint?: string;
  errorMessage?: string;
  requiresApiProcessing?: boolean;
}

export interface Section {
  title: string;
  documents: DocumentItem[];
  type: 'required';
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  status?: number;
  code?: string;
}

export interface ExtractedData {
  [documentId: string]: {
    documentType: string;
    extractedInfo: any;
    extractedAt: string;
    status: number;
    message: string;
  };
}