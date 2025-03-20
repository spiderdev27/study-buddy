export function extractStructuredContent(text: string) {
  // Split text into lines
  const lines = text.split('\n').filter(line => line.trim());
  
  // Try to identify hierarchy based on common patterns
  const hierarchyPatterns = [
    // Numbered lists (1., 1.1., etc.)
    /^(\d+\.)+\s/,
    // Bullet points with varying indentation
    /^[\s]*[-•*]\s/,
    // Roman numerals
    /^[IVXLCDMivxlcdm]+\.\s/,
    // Letter lists (a., A., etc.)
    /^[a-zA-Z]\.\s/
  ];
  
  // Process each line to determine its level in the hierarchy
  const structuredContent = lines.map(line => {
    const indentLevel = line.search(/\S/);
    const patterns = hierarchyPatterns.map(pattern => pattern.test(line));
    const hasPattern = patterns.some(p => p);
    
    return {
      text: line.trim().replace(/^[-•*\d.]+\s/, ''),
      level: hasPattern ? patterns.findIndex(p => p) : Math.floor(indentLevel / 2),
      original: line
    };
  });
  
  return structuredContent;
}

export function identifyMainTopics(structuredContent: any[]) {
  // Group content by levels
  const levels = structuredContent.reduce((acc, item) => {
    acc[item.level] = acc[item.level] || [];
    acc[item.level].push(item);
    return acc;
  }, {} as Record<number, any[]>);
  
  // The lowest level number should be main topics
  const mainLevel = Math.min(...Object.keys(levels).map(Number));
  
  return levels[mainLevel];
} 