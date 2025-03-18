import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ClassSchedule {
  day: string;
  startTime: string;
  endTime: string;
  className: string;
  location: string;
}

const isValidSchedule = (schedule: any): schedule is ClassSchedule[] => {
  if (!Array.isArray(schedule)) return false;
  
  return schedule.every(item => 
    typeof item === 'object' &&
    typeof item.day === 'string' &&
    typeof item.startTime === 'string' &&
    typeof item.endTime === 'string' &&
    typeof item.className === 'string' &&
    typeof item.location === 'string'
  );
};

export async function POST(req: Request) {
  try {
    // Validate session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get and validate image
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate image type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Invalid image format. Please upload a JPEG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    // Convert image to bytes
    const imageBytes = await imageFile.arrayBuffer();
    
    // Check file size (max 10MB)
    if (imageBytes.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size too large. Please upload an image smaller than 10MB.' },
        { status: 400 }
      );
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create image part
    const imagePart = {
      inlineData: {
        data: Buffer.from(imageBytes).toString('base64'),
        mimeType: imageFile.type
      }
    };

    // Analyze image with specific prompt
    const result = await model.generateContent([
      {
        text: `Extract class schedule information from this image. Return ONLY a valid JSON array in this exact format: [{ "day": "string", "startTime": "string", "endTime": "string", "className": "string", "location": "string" }]. Make sure all fields are present for each class. If you can't determine a value, use "Unknown". Format times in 24-hour format (HH:mm). Example: "13:30". Format days as full names: "Monday", "Tuesday", etc.`
      },
      imagePart
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', text);
      return NextResponse.json(
        { error: 'Failed to extract schedule from image' },
        { status: 500 }
      );
    }

    try {
      const schedule = JSON.parse(jsonMatch[0]);
      
      // Validate schedule format
      if (!isValidSchedule(schedule)) {
        console.error('Invalid schedule format:', schedule);
        return NextResponse.json(
          { error: 'Invalid schedule format returned from image processing' },
          { status: 500 }
        );
      }

      // Format times to ensure HH:mm format
      const formattedSchedule = schedule.map(item => ({
        ...item,
        startTime: item.startTime.match(/^\d{1,2}:\d{2}$/) 
          ? item.startTime.padStart(5, '0') 
          : '00:00',
        endTime: item.endTime.match(/^\d{1,2}:\d{2}$/) 
          ? item.endTime.padStart(5, '0') 
          : '00:00',
        day: item.day.charAt(0).toUpperCase() + item.day.slice(1).toLowerCase()
      }));

      return NextResponse.json({ schedule: formattedSchedule });
    } catch (parseError) {
      console.error('Error parsing schedule JSON:', parseError, 'Raw text:', text);
      return NextResponse.json(
        { error: 'Failed to parse schedule data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing schedule:', error);
    return NextResponse.json(
      { error: 'Failed to process schedule. Please try again.' },
      { status: 500 }
    );
  }
} 