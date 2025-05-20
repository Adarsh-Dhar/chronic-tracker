'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AnalyzePage() {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Add debugging information to the console
    console.log('Analyze page mounted');
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    setAnalysis('');
    
    try {
      console.log('Fetching analysis from API...');
      const response = await fetch('/api/analyze');
      console.log('API response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw API response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze symptom logs');
      }
      
      if (!data.data) {
        console.error('Missing data in response:', data);
        throw new Error('Invalid response format: missing data field');
      }
      
      console.log('Setting analysis data:', data.data);
      setAnalysis(data.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing your symptom logs');
      console.error('Error fetching analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Symptom Analysis</h1>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          This tool uses AI to analyze your symptom logs and generate questions and discussion topics 
          for your next doctor visit. The analysis is based on patterns in your symptoms, pain levels, 
          and triggers.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze My Symptoms'}
          </button>
          
          <Link href="/track" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center">
            Add more symptoms
          </Link>
          
          <Link href="/" className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center">
            Back to Home
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {analysis && !loading && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="prose max-w-none">
            {/* Render the markdown content */}
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(analysis) }} />
          </div>
        </div>
      )}
      
      {!analysis && !loading && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
          Click the "Analyze My Symptoms" button to generate insights from your symptom logs.
        </div>
      )}
    </div>
  );
}

// Enhanced markdown to HTML converter for the AI response format
function markdownToHtml(markdown: string): string {
  if (!markdown) return '<p>No analysis data available</p>';
  
  console.log('Converting markdown to HTML:', markdown.substring(0, 100) + '...');
  
  try {
    // Process the markdown in sections to better handle the AI response format
    let html = markdown
      // Convert headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Convert bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      
      // Convert italic
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      
      // Convert lists - handle both unordered and ordered lists
      .replace(/^\s*\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\s*\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Process sections
    const sections = html.split(/\n\n+/);
    let processedHtml = '';
    
    sections.forEach(section => {
      if (section.trim() === '') return;
      
      // Check if this section is a list
      if (section.includes('<li>')) {
        processedHtml += `<ul>${section}</ul>`;
      } 
      // Check if this is a header
      else if (section.startsWith('<h')) {
        processedHtml += section;
      } 
      // Otherwise treat as paragraph
      else {
        processedHtml += `<p>${section.replace(/\n/g, '<br>')}</p>`;
      }
    });
    
    console.log('Processed HTML length:', processedHtml.length);
    return processedHtml || '<p>Unable to format analysis results</p>';
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    // Handle the unknown error type safely
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `<p>Error formatting analysis: ${errorMessage}</p><pre>${markdown}</pre>`;
  }
}
