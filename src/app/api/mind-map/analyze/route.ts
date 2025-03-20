import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;
    
    let content = '';
    
    if (file) {
      if (file.type === 'application/pdf') {
        // Handle PDF
        const arrayBuffer = await file.arrayBuffer();
        const loader = new PDFLoader(new Blob([arrayBuffer]));
        const docs = await loader.load();
        content = docs.map(doc => doc.pageContent).join('\n');
      } else if (file.type.startsWith('image/')) {
        // Handle image using Gemini's vision model
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        const imageData = await file.arrayBuffer();
        const response = await model.generateContent([
          "Extract and organize the text content from this image in a structured format. Focus on identifying main topics, subtopics, and their relationships.",
          {
            inlineData: {
              mimeType: file.type,
              data: Buffer.from(imageData).toString('base64')
            }
          }
        ]);
        content = response.response.text();
      }
    } else if (text) {
      content = text;
    } else {
      throw new Error('No content provided');
    }

    // Use Gemini to analyze the content and generate a mind map structure
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Analyze the following content and create a detailed mind map structure. 
    Organize it into a hierarchical format with:
    - A main central topic
    - Key topics (3-5)
    - Subtopics for each key topic (2-4 each)
    - Detailed points for subtopics where relevant
    
    Format the response as a JSON structure with:
    - nodes: array of {id, text, type (main/sub/leaf), color}
    - links: array of {source, target} connections
    
    Make the structure logical and educational. Content to analyze:
    
    ${content}`;

    const result = await model.generateContent(prompt);
    const mindMapStructure = JSON.parse(result.response.text());
    
    // Add position coordinates for visual layout
    const enhancedStructure = enhanceMindMapStructure(mindMapStructure);
    
    return NextResponse.json(enhancedStructure);
    
  } catch (error) {
    console.error('Error processing content:', error);
    return NextResponse.json(
      { error: 'Failed to process content' },
      { status: 500 }
    );
  }
}

// Helper function to add visual layout coordinates
function enhanceMindMapStructure(structure: any) {
  const centerX = 400;
  const centerY = 200;
  const radius = 200;
  
  // Position main node at center
  structure.nodes[0].x = centerX;
  structure.nodes[0].y = centerY;
  
  // Group nodes by type
  const subNodes = structure.nodes.filter((n: any) => n.type === 'sub');
  const leafNodes = structure.nodes.filter((n: any) => n.type === 'leaf');
  
  // Position sub nodes in a circle around main node
  subNodes.forEach((node: any, index: number) => {
    const angle = (2 * Math.PI * index) / subNodes.length;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });
  
  // Position leaf nodes around their parent sub nodes
  leafNodes.forEach((node: any) => {
    const parentLink = structure.links.find((l: any) => l.target === node.id);
    if (parentLink) {
      const parentNode = structure.nodes.find((n: any) => n.id === parentLink.source);
      if (parentNode) {
        const angle = Math.random() * 2 * Math.PI;
        const leafRadius = 100;
        node.x = parentNode.x + leafRadius * Math.cos(angle);
        node.y = parentNode.y + leafRadius * Math.sin(angle);
      }
    }
  });
  
  return structure;
} 