
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { HumanizationConfig, HumanizationTone, Intensity, AppMode } from '../types';

export const processTextStream = async (
  text: string, 
  config: HumanizationConfig,
  onChunk: (chunk: string) => void
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const toneDescriptions = {
    [HumanizationTone.NATURAL]: "Standard human organic flow. Varied sentence lengths and natural breathing patterns in prose.",
    [HumanizationTone.CASUAL]: "Informal and relaxed. Uses contractions, soft colloquialisms, and a friendly 'over-the-fence' vibe.",
    [HumanizationTone.PROFESSIONAL]: "Expertly crafted corporate stealth. Polished, authoritative, but avoids the rigid, predictable structures of standard LLMs.",
    [HumanizationTone.ACADEMIC]: "Sophisticated and deep. Uses varied transitions and active voice to maintain rigour without sounding like a template.",
    [HumanizationTone.CREATIVE]: "Highly stylistic and unique. Employs literary devices and rhythmic variation to ensure maximum unpredictability."
  };

  const intensityGuide = {
    [Intensity.LOW]: "Light adjustments. Fixes obvious repetition and cliches.",
    [Intensity.MEDIUM]: "Significant transformation. Focuses on shifting syntax and vocabulary for fresh expression.",
    [Intensity.HIGH]: "MAXIMAL OVERHAUL. Complete re-engineering of the text's linguistic structure for maximum impact and variety."
  };

  const isStealth = config.mode === AppMode.STEALTH;

  const systemInstruction = isStealth 
    ? `You are the 'Squammy Scrambler'—a specialized linguistic engine designed to strip away the 'synthetic' signature of AI text. Your output must be indistinguishable from a human writer to all AI detection algorithms.
       
       THE SQUAMMY STEALTH PROTOCOL:
       1. **Perplexity Injection**: Use diverse vocabulary and occasionally complex syntax.
       2. **Burstiness Calibration**: Vary sentence lengths wildly (e.g., very long followed by very short).
       3. **The Banished Words**: NEVER use: "Delve," "Landscape," "Testament," "Comprehensively," "Unlock," "Harness."
       4. **Organic Flow**: Use natural, non-formulaic transitions.
       
       Core Persona: ${toneDescriptions[config.tone]}
       Stealth Level: ${intensityGuide[config.intensity]}`
    : `You are the 'Squammy Morpher'—a world-class paraphrasing engine. Your goal is to rewrite the input text to be clearer, more engaging, and linguistically diverse while keeping the EXACT same meaning.
       
       THE MORPH PROTOCOL:
       1. **Linguistic Variety**: Use fresh synonyms and varied sentence structures.
       2. **Clarity & Impact**: Ensure the message is sharp and resonant.
       3. **Creative Rephrasing**: Avoid repeating the same words as the source where possible.
       
       Morphing Style: ${toneDescriptions[config.tone]}
       Morphing Intensity: ${intensityGuide[config.intensity]}`;

  const instructionFinal = `${systemInstruction}
  
  CRITICAL OPERATIONAL RULES:
  - Output ONLY the processed text.
  - No commentary, meta-text, or "Here is your text" introductions.
  - Preservation: ${config.preserveStructure ? 'Maintain original paragraphing.' : 'Re-order for better organic flow.'}`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: text,
      config: {
        systemInstruction: instructionFinal,
        temperature: isStealth ? 0.95 : 0.85,
        topP: 0.9,
      }
    });

    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        onChunk(c.text);
      }
    }
  } catch (error) {
    console.error("Scrambler/Morpher Error:", error);
    throw error;
  }
};
