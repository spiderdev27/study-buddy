const handleGenerate = async () => {
  setIsLoading(true);
  setProgress(0);
  
  try {
    setStatus('Uploading content...');
    await simulateProgress(0, 20);
    
    // Prepare form data
    const formData = new FormData();
    if (uploadType === 'file' && file) {
      formData.append('file', file);
    } else if (uploadType === 'text' && textContent) {
      formData.append('text', textContent);
    }
    
    setStatus('Analyzing content structure...');
    await simulateProgress(20, 40);
    
    // Send to API for processing
    const response = await fetch('/api/mind-map/analyze', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze content');
    }
    
    setStatus('Generating mind map structure...');
    await simulateProgress(40, 80);
    
    const mindMapData = await response.json();
    
    setStatus('Finalizing mind map details...');
    await simulateProgress(80, 100);
    
    // Apply the generated mind map
    onApplyGenerated(mindMapData);
    
  } catch (error) {
    console.error('Error processing content:', error);
    setStatus('Error processing content. Please try again.');
  } finally {
    setIsLoading(false);
  }
}; 