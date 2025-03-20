import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper function to convert a file to a format Gemini can process
 * @param file The file to convert
 * @returns Promise with file data in the format needed for Gemini
 */
export async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract the base64 data
      const base64String = result.split(',')[1];
      resolve(base64String);
    };
    reader.readAsDataURL(file);
  });

  const base64EncodedData = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type
    },
  };
}
