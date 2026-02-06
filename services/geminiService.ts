import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Attachment } from "../types";

// Ensure API Key is available
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateChatResponse = async (
  modelId: string,
  history: Message[],
  currentMessage: string,
  attachments: Attachment[]
): Promise<string> => {
  try {
    // Basic message content
    const contents: any = [currentMessage];

    // Add attachments if they exist (handling images)
    if (attachments.length > 0) {
      // Create parts for the prompt
      const parts = [];
      
      for (const att of attachments) {
        if (att.type.startsWith('image/')) {
           // Remove data:image/png;base64, prefix if present for pure base64
           const base64Data = att.data.split(',')[1];
           parts.push({
             inlineData: {
               mimeType: att.type,
               data: base64Data
             }
           });
        }
      }
      
      if (parts.length > 0) {
        parts.push({ text: currentMessage });
        // Use the object structure for contents when mixing parts
        // However, the simplest way for single-turn generation in this architecture 
        // is to construct the prompt. For history, it's more complex, 
        // so for this MVP we will treat it as a single turn generation 
        // with context or use the chat feature if we were persisting the session object.
        // To keep it stateless and robust:
        
        const response = await ai.models.generateContent({
            model: modelId,
            contents: { parts }
        });
        return response.text || "No response generated.";
      }
    }

    // Text only flow
    // We construct a chat session for context awareness
    const chat = ai.chats.create({
      model: modelId,
      history: history.filter(h => !h.isError).map(h => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessage({ message: currentMessage });
    return result.text || "";

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate response");
  }
};
