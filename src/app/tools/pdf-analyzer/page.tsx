'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NavBar } from '@/components/navigation/NavBar';
import { useTheme } from '@/app/theme-selector';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

export default function PDFAnalyzer() {
  const { theme, colors } = useTheme();
  
  // PDF states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string>('');
  const [pdfMetadata, setPdfMetadata] = useState<{
    filename?: string;
    pageCount?: number;
    wordCount?: number;
    title?: string;
    author?: string;
  } | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);
  
  // Chat states
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showNewMessagesIndicator, setShowNewMessagesIndicator] = useState(false);
  
  // New state for text extraction status
  const [textExtractionStatus, setTextExtractionStatus] = useState('Not started');
  
  // Direct to Gemini option (new)
  const [directToGemini, setDirectToGemini] = useState(true);
  
  // Fallback PDF rendering using browser's built-in PDF viewer as iframe
  const [useFallbackViewer, setUseFallbackViewer] = useState(true); // Start with fallback viewer by default
  
  // Function to handle page navigation
  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(numPages || 1, newPageNumber));
    });
  };

  // Initialize PDF.js worker on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      console.log('PDF.js worker initialized with version:', pdfjs.version);
    }
  }, []);
  
  // Add keyboard shortcuts in a separate effect
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts when not typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Ctrl/Cmd + / to focus question input
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        const questionInput = document.getElementById('question-input');
        if (questionInput) {
          questionInput.focus();
        }
      }
      
      // Left/Right arrow keys for page navigation when PDF is loaded
      if (pdfFile && !useFallbackViewer && numPages) {
        if (e.key === 'ArrowLeft') {
          changePage(-1);
        } else if (e.key === 'ArrowRight') {
          changePage(1);
        }
      }
      
      // Esc to clear question input when focused
      if (e.key === 'Escape') {
        const questionInput = document.getElementById('question-input');
        if (document.activeElement === questionInput) {
          setQuestion('');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pdfFile, useFallbackViewer, numPages]);

  // Function to handle scroll events in the chat container
  const handleChatScroll = () => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowNewMessagesIndicator(!isAtBottom);
    }
  };

  // Add scroll event listener to the chat container
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleChatScroll);
      return () => chatContainer.removeEventListener('scroll', handleChatScroll);
    }
  }, []);

  // Clean up object URL when component unmounts or when PDF changes
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        console.log('Cleaning up object URL');
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Scroll to bottom of chat history when new messages are added
  useEffect(() => {
    if (typeof window === 'undefined' || !chatHistory.length) return;

    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainer;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    // Only auto-scroll when user is already at the bottom or this is the first message
    if (isAtBottom || chatHistory.length === 1) {
      const timer = setTimeout(() => {
        if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Alternative method for scrolling if the ref approach doesn't work well
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        
        setShowNewMessagesIndicator(false);
      }, 100); // Small delay to ensure DOM is updated
      
      return () => clearTimeout(timer);
    } else {
      // User has scrolled up, show the new message indicator
      setShowNewMessagesIndicator(true);
    }
  }, [chatHistory]);

  // Toggle between pdf.js viewer and fallback iframe viewer
  const toggleViewerMode = () => {
    setUseFallbackViewer(prev => !prev);
    console.log('Toggled PDF viewer mode to:', !useFallbackViewer ? 'Fallback' : 'PDF.js');
  };

  // Toggle direct to Gemini mode
  const toggleDirectToGemini = () => {
    setDirectToGemini(prev => !prev);
    console.log('Toggled direct to Gemini mode:', !directToGemini);
  };

  // Function to handle PDF upload
  const handlePdfUpload = async (file: File) => {
    if (!file) return;
    
    console.log('Starting PDF upload process for:', file.name);
    setUploadLoading(true);
    setError(null);
    setPdfLoadError(null);
    setTextExtractionStatus('Starting');
    
    try {
      // Create object URL for the PDF viewer
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      console.log('Created object URL for PDF viewer');
      
      // Upload file to server
      console.log('Uploading PDF to endpoint:', '/api/minimal-pdf');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/minimal-pdf', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      console.log('Server response:', data);
      
      if (data.success) {
        setPdfFile(file);
        console.log('PDF file set successfully');
        
        // If direct to Gemini is enabled, we'll skip text extraction and just store basic metadata
        if (directToGemini) {
          setPdfMetadata({
            filename: file.name,
            title: file.name,
            author: 'Unknown',
          });
          
          // Add system message to chat history
          setChatHistory([{
            role: 'system',
            content: `PDF "${file.name}" has been loaded. You can now ask questions about it. The PDF will be sent directly to Gemini for analysis.`
          }]);
          
          setTextExtractionStatus('PDF ready for Gemini processing');
          setUploadLoading(false);
          return;
        }
        
        // Process the PDF to extract text (only if not using direct to Gemini)
        try {
          console.log('Starting PDF text extraction');
          setTextExtractionStatus('Reading file');
          // Extract text from PDF using pdf.js
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              console.log('FileReader loaded PDF data');
              setTextExtractionStatus('Processing PDF');
              const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
              console.log('Loading PDF with pdf.js, data size:', typedArray.length);
              
              try {
                const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
                console.log('PDF loaded successfully, pages:', pdf.numPages);
                setTextExtractionStatus(`Extracting text from ${pdf.numPages} pages`);
                
                let fullText = '';
                
                // Extract text from each page
                for (let i = 1; i <= pdf.numPages; i++) {
                  console.log(`Processing page ${i} of ${pdf.numPages}`);
                  setTextExtractionStatus(`Extracting text from page ${i}/${pdf.numPages}`);
                  const page = await pdf.getPage(i);
                  const content = await page.getTextContent();
                  const text = content.items
                    .map((item: any) => item.str)
                    .join(' ');
                  fullText += text + ' ';
                }
                
                console.log('Text extraction complete, text length:', fullText.length);
                console.log('First 200 characters of extracted text:', fullText.substring(0, 200));
                
                // Set the extracted text
                setPdfText(fullText);
                setTextExtractionStatus('Complete');
                
                // Set metadata
                const wordCount = fullText.split(/\s+/).filter(Boolean).length;
                setPdfMetadata({
                  filename: file.name,
                  pageCount: pdf.numPages,
                  wordCount,
                  title: file.name,
                  author: 'Unknown',
                });
                console.log('PDF metadata set', { pages: pdf.numPages, words: wordCount });
                
                // Add system message to chat history
                setChatHistory([{
                  role: 'system',
                  content: `PDF "${file.name}" has been loaded. It contains ${pdf.numPages} pages and approximately ${wordCount} words. You can now ask questions about the content.`
                }]);
                
                setNumPages(pdf.numPages);
                setPageNumber(1);
              } catch (pdfLoadError) {
                console.error('Error loading PDF with PDF.js:', pdfLoadError);
                setTextExtractionStatus('Failed to load PDF with PDF.js');
                
                // Fallback: Create a simple text representation for minimal functionality
                setPdfText(`File: ${file.name}\nThis PDF could not be processed for text extraction, but you can still view it and ask general questions.`);
                setPdfMetadata({
                  filename: file.name,
                  title: file.name,
                  author: 'Unknown',
                });
                setChatHistory([{
                  role: 'system',
                  content: `PDF "${file.name}" has been loaded for viewing, but text extraction failed. You can ask general questions about the document.`
                }]);
              }
            } catch (innerError) {
              console.error('Error in FileReader onload:', innerError);
              setTextExtractionStatus('Error in FileReader');
              setPdfLoadError(`Error processing PDF: ${innerError instanceof Error ? innerError.message : 'Unknown error'}`);
            }
          };
          
          reader.onerror = (error) => {
            console.error('FileReader error:', error);
            setTextExtractionStatus('FileReader error');
            setPdfLoadError('Error reading the PDF file');
          };
          
          reader.readAsArrayBuffer(file);
        } catch (pdfError) {
          console.error('Error extracting text from PDF:', pdfError);
          setTextExtractionStatus('Text extraction failed');
          setPdfText('Could not extract text from this PDF. It may be scanned or secured.');
          setPdfLoadError(`PDF text extraction failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
        }
      } else {
        throw new Error(data.error || 'Failed to process PDF');
      }
    } catch (err: any) {
      console.error('Error handling PDF upload:', err);
      setTextExtractionStatus('Error handling upload');
      setError(err.message || 'An unexpected error occurred while processing the PDF. Please try again.');
      
      // If we had set the URL but then encounter an error, we should revoke it
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    } finally {
      setUploadLoading(false);
    }
  };

  // Function to ask questions about the PDF
  const handleAskQuestion = async () => {
    console.log('handleAskQuestion called with question:', question);
    console.log('PDF file available:', Boolean(pdfFile));
    console.log('Using direct to Gemini:', directToGemini);
    
    if (!question.trim()) {
      setError('Please enter a question about the PDF.');
      return;
    }
    
    if (!pdfFile && !directToGemini) {
      console.error('Missing PDF file', { question, hasPdfFile: Boolean(pdfFile) });
      setError(`Please ensure a PDF is uploaded first.`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Add user question to chat history
    setChatHistory(prev => [...prev, { role: 'user', content: question }]);
    
    try {
      console.log('Sending request to API...');
      
      // If using direct to Gemini, we'll use the /api/tools/pdf/direct-query endpoint instead
      const endpoint = directToGemini ? '/api/tools/pdf/direct-query' : '/api/tools/pdf/query';
      
      // Prepare request payload based on mode
      let requestBody: any = {};
      
      if (directToGemini && pdfFile) {
        // Create FormData to send the file directly to the server-side Gemini
        const formData = new FormData();
        formData.append('query', question);
        formData.append('file', pdfFile);
        
        // Use FormData for direct mode
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });
        
        console.log('API response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error response:', errorData);
          throw new Error(errorData.error || 'Failed to process question');
        }
        
        const data = await response.json();
        console.log('API success response:', data);
        
        // Add AI response to chat history
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        // Use the regular text-based approach
        let response;
        let data;
        
        try {
          response = await fetch('/api/tools/pdf/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: question,
              pdfText,
              filename: pdfMetadata?.filename,
            }),
          });

          console.log('API response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('API error response:', errorData);
            throw new Error(errorData.error || 'Failed to process question');
          }

          data = await response.json();
          console.log('API success response:', data);
        } catch (apiError) {
          console.error('Main API failed, trying test endpoint:', apiError);
          
          // Try the test endpoint as fallback
          const testResponse = await fetch('/api/test-pdf-api', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: question,
              pdfTextSample: pdfText.substring(0, 500) + '...',
              filename: pdfMetadata?.filename,
            }),
          });
          
          if (!testResponse.ok) {
            throw apiError; // Rethrow the original error if test also fails
          }
          
          const testData = await testResponse.json();
          console.log('Test API response:', testData);
          
          // Create a mock response for UI to show
          data = {
            success: true,
            query: question,
            answer: "The API is currently experiencing issues. This is a fallback response. Our technical team is working on it. Here's what we received:\n\n" + 
                   JSON.stringify(testData, null, 2)
          };
        }
        
        // Add AI response to chat history
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer }]);
      }
      
      // Clear the question input
      setQuestion('');
    } catch (err: any) {
      console.error('Error processing question:', err);
      
      // Extract detailed error message if available
      let errorMessage = 'Failed to get an answer. Please try again.';
      let detailedError = '';
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      // Try to extract API error details if available
      try {
        if (typeof err.cause === 'object' && err.cause !== null) {
          detailedError = JSON.stringify(err.cause);
        }
      } catch (e) {
        console.error('Error parsing error details:', e);
      }
      
      setError(errorMessage);
      
      // Add error message to chat history
      setChatHistory(prev => [...prev, { 
        role: 'system', 
        content: `Error: ${errorMessage}${detailedError ? `\n\nDetails: ${detailedError}` : ''}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };
  
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF document loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
  };
  
  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF document:', error);
    setPdfLoadError(`Error loading PDF: ${error.message}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary to-bg-secondary">
      {/* Header with navigation */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PDF Analyzer
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            {pdfFile && (
              <button
                onClick={() => {
                  if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                  setPdfFile(null);
                  setPdfUrl(null);
                  setPdfText('');
                  setPdfMetadata(null);
                  setChatHistory([]);
                  setNumPages(null);
                  setPageNumber(1);
                  setPdfLoadError(null);
                  setTextExtractionStatus('Not started');
                }}
                className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center group relative"
                title="Start a new analysis (Clear current PDF)"
                aria-label="Start a new analysis"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                New Analysis
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-white/10 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Clear the current PDF and start a new analysis
                </div>
              </button>
            )}
            <button
              onClick={toggleDirectToGemini}
              className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center group relative"
              title={directToGemini ? "Using direct PDF analysis with Gemini" : "Using text extraction for analysis"}
              aria-label={directToGemini ? "Switch to text extraction mode" : "Switch to direct analysis mode"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                <path d="M12 6V12M12 12V18M12 12H18M12 12H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {directToGemini ? "Direct Mode" : "Extract Mode"}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-white/10 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {directToGemini ? 
                  "Sends PDF directly to Gemini for analysis" : 
                  "Extracts text before analysis"}
              </div>
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* PDF Upload Section - Show only when no PDF is uploaded */}
        {!pdfFile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  PDF Analyzer
                </h1>
                <p className="text-text-secondary max-w-xl">
                  Upload a PDF document and ask questions about its content. Our AI will analyze the document and provide detailed answers.
                </p>
              </div>

              <div 
                className="border-2 border-dashed border-white/10 hover:border-primary/30 transition-colors rounded-xl p-10 text-center"
                onClick={() => document.getElementById('file-upload')?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handlePdfUpload(file);
                }}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <div className="cursor-pointer flex flex-col items-center justify-center">
                  <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-text-secondary">
                      <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 16.2091 19.2091 18 17 18H7C4.79086 18 3 16.2091 3 14C3 11.7909 4.79086 10 7 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 13V17M12 13L14 15M12 13L10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2">Drop your PDF here or click to browse</h3>
                  <p className="text-text-secondary text-sm mb-4">Supports PDF files up to 10MB</p>
                  
                  <button className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary rounded-lg text-white font-medium shadow-lg hover:shadow-primary/20 transition-shadow">
                    Select PDF
                  </button>
                  
                  {uploadLoading && (
                    <div className="mt-4 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span className="ml-2">Uploading...</span>
                    </div>
                  )}
                  
                  {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // PDF Analysis UI - Show when PDF is uploaded
          <div className="flex flex-col space-y-6">
            {/* PDF Info Bar */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-wrap items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold">{pdfFile.name}</h2>
                  <div className="flex text-xs text-text-secondary mt-1 space-x-3">
                    {pdfMetadata?.pageCount && <span>{pdfMetadata.pageCount} pages</span>}
                    {pdfMetadata?.wordCount && <span>~{pdfMetadata.wordCount} words</span>}
                    <span>{Math.round(pdfFile.size / 1024)} KB</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                <button 
                  onClick={toggleViewerMode} 
                  className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg flex items-center"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                  {useFallbackViewer ? 'Browser View' : 'PDF.js View'}
                </button>
                <div className="hidden md:flex items-center text-xs text-text-secondary bg-white/5 px-2 py-1 rounded-full">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                    <path d="M12 16V12" />
                    <path d="M12 8H12.01" />
                  </svg>
                  {directToGemini ? 'Direct AI Analysis' : 'Text Extraction Mode'}
                </div>
              </div>
            </div>
            
            {/* Two-Column Layout for PDF and Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PDF Viewer Column */}
              <div className="flex flex-col space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <h2 className="font-medium">Document Viewer</h2>
                    {numPages && !useFallbackViewer && (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => changePage(-1)}
                          disabled={pageNumber <= 1}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <span className="text-sm">
                          {pageNumber} / {numPages}
                        </span>
                        <button
                          onClick={() => changePage(1)}
                          disabled={pageNumber >= (numPages || 1)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-h-[60vh] relative">
                    {pdfLoadError ? (
                      <div className="p-6 flex flex-col items-center justify-center h-full">
                        <div className="p-3 bg-red-500/10 rounded-full mb-4">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        </div>
                        <h3 className="text-red-400 font-medium mb-2">Error Loading PDF</h3>
                        <p className="text-sm text-center mb-4">{pdfLoadError}</p>
                        <div className="flex space-x-3">
                          <button 
                            className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/15"
                            onClick={() => {
                              if (pdfFile) handlePdfUpload(pdfFile);
                            }}
                          >
                            Try Again
                          </button>
                          <button 
                            className="px-4 py-2 bg-white/5 rounded-lg text-sm"
                            onClick={toggleViewerMode}
                          >
                            Try {useFallbackViewer ? 'PDF.js' : 'Browser'} Viewer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {useFallbackViewer ? (
                          <iframe 
                            src={pdfUrl || ''} 
                            className="w-full h-full border-0" 
                            title="PDF Viewer"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full p-4">
                            {!numPages && !pdfLoadError && (
                              <div className="flex flex-col items-center justify-center h-full w-full">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
                                <p>Loading PDF...</p>
                              </div>
                            )}
                            
                            <Document
                              file={pdfUrl}
                              onLoadSuccess={onDocumentLoadSuccess}
                              onLoadError={onDocumentLoadError}
                              className="w-full max-h-[60vh] overflow-auto"
                              loading={
                                <div className="flex items-center justify-center h-full min-h-[400px]">
                                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                                </div>
                              }
                              error={
                                <div className="p-4 flex flex-col items-center justify-center">
                                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400 mb-2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                  </svg>
                                  <h3 className="text-red-400 font-medium">Error Loading PDF with PDF.js</h3>
                                  <p className="text-sm mt-1">Try using the browser viewer option instead.</p>
                                </div>
                              }
                            >
                              {numPages && (
                                <Page 
                                  pageNumber={pageNumber} 
                                  width={600}
                                  className="mx-auto"
                                  renderTextLayer={true}
                                  renderAnnotationLayer={true}
                                />
                              )}
                            </Document>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* AI Chat Column */}
              <div className="flex flex-col space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full min-h-[60vh]">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center">
                      <h2 className="font-medium">AI Assistant</h2>
                      <div className="ml-2 px-2 py-0.5 bg-primary/20 rounded-full text-xs text-primary">Gemini AI</div>
                    </div>
                    
                    {chatHistory.length > 0 && (
                      <button
                        onClick={() => setChatHistory([])}
                        className="p-1.5 text-text-secondary hover:text-white rounded-md transition-colors"
                        title="Clear Conversation"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 6h-4V4H9v2H5v2h14z" />
                          <path d="M6 8v12c0 .6.4 1 1 1h10c.6 0 1-.4 1-1V8" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Chat Messages */}
                  <div 
                    className="flex-1 overflow-y-auto p-4 relative" 
                    id="chat-container"
                    style={{ 
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}
                  >
                    {chatHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary">
                            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium mb-2">Ask Questions About Your PDF</h3>
                        <p className="text-text-secondary mb-4">
                          {directToGemini ? 
                            "I'll analyze your document and answer any questions you have about it." : 
                            "I've extracted the text from your PDF. What would you like to know about it?"}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 max-w-md">
                          {["What is this document about?", "Summarize the key points", "What are the main conclusions?"].map(q => (
                            <button
                              key={q}
                              onClick={() => {
                                setQuestion(q);
                                setTimeout(() => handleAskQuestion(), 100);
                              }}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {chatHistory.map((message, index) => (
                          <div
                            key={index}
                            className={`mb-5 ${
                              message.role === 'user'
                                ? 'text-right'
                                : message.role === 'system'
                                ? 'text-center'
                                : 'text-left'
                            }`}
                          >
                            <div
                              className={`inline-block rounded-xl p-3 max-w-[90%] ${
                                message.role === 'user'
                                  ? 'bg-primary/70 text-white rounded-tr-none shadow-sm shadow-primary/20'
                                  : message.role === 'system'
                                  ? 'bg-white/5 text-text-secondary text-sm'
                                  : 'bg-white/5 text-text-primary rounded-tl-none'
                              } ${message.role === 'assistant' ? 'ai-response' : ''}`}
                            >
                              {message.role === 'assistant' && (
                                <div className="text-xs text-text-secondary mb-2 flex items-center">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  {directToGemini ? 'Gemini (Direct PDF Analysis)' : 'Gemini AI'}
                                </div>
                              )}
                              {message.role === 'system' && (
                                <div className="text-xs text-text-secondary mb-1 flex items-center justify-center">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 8L12 8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  System
                                </div>
                              )}
                              <div className={`whitespace-pre-wrap ${message.role === 'system' ? 'system-content' : ''}`}>
                                {message.role === 'user' ? (
                                  <div className="user-message">
                                    {message.content}
                                  </div>
                                ) : (
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                                    components={{
                                      // Using the existing components with inline styles
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </>
                    )}
                    
                    {/* New Messages Indicator */}
                    {showNewMessagesIndicator && (
                      <div 
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-3 py-1.5 rounded-full text-sm shadow-lg cursor-pointer z-10 flex items-center space-x-1 animate-bounce"
                        onClick={() => {
                          if (chatEndRef.current) {
                            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
                            setShowNewMessagesIndicator(false);
                          }
                        }}
                      >
                        <span>New messages</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Question Input */}
                  <div className="p-3 border-t border-white/5">
                    <div className="relative">
                      <textarea
                        id="question-input"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                        placeholder={pdfFile ? "Ask anything about this document... (Ctrl + / to focus)" : "Upload a PDF first to ask questions"}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={isLoading || !pdfFile}
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAskQuestion();
                          }
                        }}
                        aria-label="Ask a question about the PDF"
                      ></textarea>
                      
                      <button
                        className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-primary to-secondary rounded-lg text-white shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed group"
                        onClick={handleAskQuestion}
                        disabled={isLoading || !question.trim() || !pdfFile}
                        aria-label={isLoading ? "Processing question..." : "Send question"}
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-white/10 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Press Enter to send
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs text-text-secondary">
                      <div className="flex items-center space-x-3">
                        <span>Press Enter to send</span>
                        <span>Shift+Enter for new line</span>
                        <span>Ctrl+/ to focus</span>
                      </div>
                      <span>Powered by Gemini 2.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer Navigation */}
      <NavBar />
      
      <style jsx global>{`
        /* Custom Scrollbar Styles */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        /* User message styling */
        .user-message {
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        /* AI response styling */
        .ai-response {
          width: fit-content;
          max-width: 90% !important;
        }
        
        .ai-response ul li,
        .ai-response ol li {
          margin-bottom: 0.5rem;
        }
        
        /* Loading skeleton animation */
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .loading-skeleton {
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.03) 25%, 
            rgba(255, 255, 255, 0.08) 37%, 
            rgba(255, 255, 255, 0.03) 63%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        /* Focus styles for better accessibility */
        :focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }
        
        /* Adjustments for mobile */
        @media (max-width: 640px) {
          .ai-response {
            max-width: 100% !important;
          }
          
          .chat-controls {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
} 