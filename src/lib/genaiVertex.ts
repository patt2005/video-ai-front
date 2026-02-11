import { GoogleGenAI } from '@google/genai';

const DEFAULT_API_KEY = 'AQ.Ab8RN6J4pu66fdo4QBgp698SE4zH60nerZ9sBla0VDwJQt23ag';

function createGenAIInstance(): GoogleGenAI {
  return new GoogleGenAI({
    vertexai: true,
    apiKey: DEFAULT_API_KEY
  });
}

let _instance: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!_instance) _instance = createGenAIInstance();
  return _instance;
}