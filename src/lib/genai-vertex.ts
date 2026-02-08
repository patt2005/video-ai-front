import { GoogleGenAI } from '@google/genai';

const DEFAULT_LOCATION = 'us-central1';
const DEFAULT_PROJECT_ID = 'striking-optics-480108-r7';
const DEFAULT_API_KEY = 'AQ.Ab8RN6JY34y394e_t1SrKOXBOdmdLl2Vhhmb6a2g_GwhH1pt5A';

function createGenAIInstance(): GoogleGenAI {
  const project =
    (typeof process !== 'undefined' && process.env.PROJECT_ID) || DEFAULT_PROJECT_ID;
  const location =
    (typeof process !== 'undefined' && process.env.GOOGLE_CLOUD_LOCATION) || DEFAULT_LOCATION;

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