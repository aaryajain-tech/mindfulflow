import express from 'express';
import path from 'path';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini client lazily/safely
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // 2. Brain Dump to Actionable Tasks AI conversion
  app.post('/api/brain-dump', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Text content is required' });
      }

      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Deconstruct the following mental clutter / brain dump into 3 to 6 distinct, clear, actionable task items. 
For each task, assign an appropriate priority ("high", "medium", or "low") and category ("work", "health", "relax", or "quick_win").

User Brain Dump:
"${text}"`,
        config: {
          systemInstruction: 'You are a compassionate productivity coach specializing in anti-doomscrolling and mindfulness. Break down overwhelm into simple, achievable step-by-step tasks.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tasks: {
                type: Type.ARRAY,
                description: 'List of extracted actionable tasks',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING, description: 'Short, clear task title' },
                    priority: { type: Type.STRING, description: 'high, medium, or low' },
                    category: { type: Type.STRING, description: 'work, health, relax, or quick_win' },
                  },
                  required: ['text', 'priority', 'category'],
                },
              },
            },
            required: ['tasks'],
          },
        },
      });

      const jsonText = response.text ? response.text.trim() : '{}';
      const parsed = JSON.parse(jsonText);
      return res.json({ tasks: parsed.tasks || [] });
    } catch (error: any) {
      console.error('Error in /api/brain-dump:', error);
      // Fallback local task extraction if API error occurs
      const fallbackText = req.body?.text || '';
      const fallbackLines = fallbackText
        .split('\n')
        .map((line: string) => line.replace(/^[-*•0-9.]+\s*/, '').trim())
        .filter((line: string) => line.length > 2);

      const tasks = (fallbackLines.length > 0 ? fallbackLines : [fallbackText]).slice(0, 5).map((t: string) => ({
        text: t,
        priority: 'medium',
        category: 'quick_win',
      }));

      return res.json({ tasks, fallback: true });
    }
  });

  // 3. AI Quote Generator for Calm Rewards
  app.post('/api/quote', async (req, res) => {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: 'Generate a soothing, deeply inspiring mindfulness quote to reward someone for stepping away from doomscrolling and completing their daily intentions.',
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: 'The uplifting quote text' },
              author: { type: Type.STRING, description: 'Author name or Mindful Wisdom' },
            },
            required: ['text', 'author'],
          },
        },
      });

      const jsonText = response.text ? response.text.trim() : '{}';
      const parsed = JSON.parse(jsonText);
      return res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/quote:', error);
      const fallbackQuotes = [
        { text: 'Peace comes from within. Do not seek it without.', author: 'Buddha' },
        { text: 'The present moment is filled with joy and happiness. If you are attentive, you will see it.', author: 'Thich Nhat Hanh' },
        { text: 'Almost everything will work again if you unplug it for a few minutes, including you.', author: 'Anne Lamott' },
        { text: 'Smile, breathe and go slowly.', author: 'Thich Nhat Hanh' }
      ];
      const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      return res.json(randomQuote);
    }
  });

  // 4. Gemini Text-To-Speech endpoint
  app.post('/api/tts', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Text is required' });

      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: `Say calmly and encouragingly: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({ audioBase64: base64Audio });
      } else {
        return res.status(500).json({ error: 'No audio generated' });
      }
    } catch (error: any) {
      console.error('TTS endpoint error:', error);
      return res.status(500).json({ error: error.message || 'TTS generation failed' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MindfulFlow server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
