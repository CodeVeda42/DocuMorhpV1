import OpenAI from 'openai';
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize OpenAI client
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Configure PDF.js worker
// We use a specific version to ensure CDN compatibility. 
// The version imported from 'pdfjs-dist' will match package.json (3.11.174).
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type;

  try {
    if (fileType === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the document
      const loadingTask = getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const numPages = pdf.numPages;

      // Iterate through pages
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
        fullText += pageText + '\n\n';
      }
      
      return fullText;
    } 
    else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    else {
      // Fallback for text files
      return await file.text();
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error(`Failed to extract text from file: ${file.name}. Ensure the file is not corrupted.`);
  }
};

export const processDocumentWithAI = async (text: string, type: string) => {
  // Mock response structure for fallback
  const mockResponse = {
    summary: "This is a simulated AI summary of the document. Connect your OpenAI API key to get real insights.",
    confidenceScore: 0.85,
    entities: [
      { label: "Document Type", value: type, category: "Classification" },
      { label: "Word Count", value: text.split(' ').length.toString(), category: "Statistics" }
    ],
    tables: [],
    sections: [
        { id: '1', type: 'h1', content: 'Extracted Document Title' },
        { id: '2', type: 'paragraph', content: text.substring(0, 300) + '...' }
    ]
  };

  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    // Return mock if no key
    console.warn("No OpenAI API Key found. Using mock data.");
    return new Promise(resolve => setTimeout(() => resolve(mockResponse), 1500));
  }

  try {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    
    const completion = await openai.chat.completions.create({
        messages: [
            { 
                role: "system", 
                content: "You are a document analyzer. Extract a summary, key entities, tables, and structured sections (h1, h2, paragraph) from the text. Return JSON with keys: summary, confidenceScore, entities, tables, sections." 
            },
            { role: "user", content: `Analyze this ${type} document:\n\n${text.substring(0, 8000)}` }
        ],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    return content ? JSON.parse(content) : mockResponse;

  } catch (error) {
    console.error("AI Processing Error", error);
    return mockResponse;
  }
};
