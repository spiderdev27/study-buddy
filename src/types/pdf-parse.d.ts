declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    text: string;
    info: {
      Title?: string;
      Author?: string;
      CreationDate?: string;
      [key: string]: any;
    };
  }

  const parse: (dataBuffer: Buffer) => Promise<PDFData>;
  export default parse;
} 