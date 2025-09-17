// components/PDFUpload.tsx
'use client';

import { useState, ChangeEvent } from 'react';

interface ExtractedData {
  success: boolean;
  text: string;
  info: {
    pages: number;
    version: string;
    filename: string;
  };
}

export default function PDFUpload(): JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError('');
      setExtractedText('');
    } else {
      setError('Please select a valid PDF file');
      setSelectedFile(null);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/extract-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract text from PDF');
      }

      const data: ExtractedData = await response.json();
      setExtractedText(data.text);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while processing the PDF';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setSelectedFile(null);
    setExtractedText('');
    setError('');
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">PDF Text Extractor</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select PDF File
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {selectedFile && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Selected file: <span className="font-medium">{selectedFile.name}</span>
          </p>
          <p className="text-sm text-gray-600">
            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Extracting...' : 'Extract Text'}
        </button>
        
        <button
          onClick={handleClear}
          disabled={loading}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Clear
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Processing PDF...</span>
        </div>
      )}

      {extractedText && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Extracted Text:</h3>
          <div className="bg-gray-50 border rounded-md p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {extractedText}
            </pre>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => navigator.clipboard?.writeText(extractedText)}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}