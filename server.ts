import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// System prompt grounding the assistant specifically as GDG on Campus MMMUT
const GDG_SYSTEM_INSTRUCTION = `You are "DevBot" - the friendly, knowledgeable AI community assistant for Google Developer Groups (GDG) on Campus at Madan Mohan Malaviya University of Technology (MMMUT), Gorakhpur.
Key Information:
- Community: Google Developer Groups on Campus — MMMUT (short name: GDG on Campus MMMUT). Formerly DSC MMMUT.
- Location: MMMUT Campus, Gorakhpur, Uttar Pradesh, India.
- Motto: BUILD. LEARN. CONNECT. "Where MMMUT Developers Build What's Next."
- Purpose: A student developer community where curious minds learn modern technologies, build meaningful projects, collaborate, and explore emerging tech.
- Tracks: Web Development, Cloud Computing, AI / Machine Learning, Android / Mobile, Open Source, and DSA.
- Flagship Community Projects:
  1. CampusConnect - student campus opportunity & event discovery platform (HTML, CSS, JS).
  2. DevTrack - developer progress and coding habit dashboard (Node.js, Express, MongoDB).
  3. EcoSense - IoT environmental telemetry station with ESP32 and live dashboard.
- Flagship Events:
  1. Code & Coffee (15 NOV) - informal developer meetup and project showcase.
  2. Web Development Workshop (22 NOV) - hands-on workshop on modern web tech.
  3. Buildathon @ MMMUT (06 DEC) - 24hr collaborative hackathon prototype competition.
- Official WhatsApp Community Link: https://chat.whatsapp.com/LKWEOfb7UjY9ARnnowM44U?s=cl&p=a&ilr=1
- Official LinkedIn: https://www.linkedin.com/company/dscmmmut/
- Official Instagram: https://www.instagram.com/gdgmmmut?igsh=Y3EydHF3NXo0YWgz
- Official Email: gdg.mmmut.official@gmail.com

Formatting:
Keep your answers enthusiastic, concise, and easy to read with bullet points when listing items. Always welcome students from all years and branches at MMMUT to join the WhatsApp group!`;

// Smart local fallback responses if API key is absent or quota is limited
function getSmartFallbackReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('event') || lower.includes('workshop') || lower.includes('hackathon')) {
    return `Here are the upcoming GDG on Campus MMMUT events:
• **Code & Coffee (15 NOV)**: Relaxed community meetup where students connect, discuss technologies, and demo what they are building.
• **Web Development Workshop (22 NOV)**: Hands-on deep dive covering modern web stacks, semantic markup, responsive design, and APIs.
• **Buildathon @ MMMUT (06 DEC)**: Collaborative hackathon turning creative ideas into working prototypes.

Tap **Register** or **Learn More** in the Events section, or join our WhatsApp community to stay updated!`;
  }

  if (lower.includes('email') || lower.includes('contact') || lower.includes('mail') || lower.includes('reach')) {
    return `You can reach out to GDG on Campus MMMUT directly via our official email: [gdg.mmmut.official@gmail.com](mailto:gdg.mmmut.official@gmail.com). You can also connect through our official [WhatsApp Community](https://chat.whatsapp.com/LKWEOfb7UjY9ARnnowM44U?s=cl&p=a&ilr=1)!`;
  }

  if (lower.includes('join') || lower.includes('whatsapp') || lower.includes('membership') || lower.includes('register')) {
    return `Joining **GDG on Campus MMMUT** is completely free for all MMMUT students!
1. Join our official [WhatsApp Community](https://chat.whatsapp.com/LKWEOfb7UjY9ARnnowM44U?s=cl&p=a&ilr=1) to get direct access to all announcements, team allocations, and event links.
2. Follow our [LinkedIn](https://www.linkedin.com/company/dscmmmut/) and [Instagram](https://www.instagram.com/gdgmmmut?igsh=Y3EydHF3NXo0YWgz) handles.
3. Come to our next meetups in campus and start collaborating!`;
  }

  if (lower.includes('project') || lower.includes('track') || lower.includes('tech') || lower.includes('stack')) {
    return `At GDG on Campus MMMUT, we actively build projects across multiple tracks:
• **CampusConnect**: Student campus discovery portal built with HTML, CSS, and JS.
• **DevTrack**: Coding practice and consistency tracker built with Node.js and MongoDB.
• **EcoSense**: Smart IoT sensor platform powered by ESP32 microcontrollers.

Have an idea for a project? Connect with us via the contact form or our WhatsApp group!`;
  }

  return `Hey there! Welcome to **GDG on Campus MMMUT**! 🚀
We are the premier developer community at Madan Mohan Malaviya University of Technology, Gorakhpur. Here you can:
• Learn cutting-edge tech (Web, Cloud, AI/ML, Android)
• Team up with peers on real projects
• Participate in hackathons and hands-on workshops

How can I help you today? Ask me about upcoming events, how to join, our project tracks, or how to get started!`;
}

// Multi-turn Gemini Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const userText = message || (Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1].text : 'Hello');

    if (!apiKey) {
      return res.json({ reply: getSmartFallbackReply(userText) });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: {
        systemInstruction: GDG_SYSTEM_INSTRUCTION,
      },
    });

    // Populate conversation history if available
    if (Array.isArray(messages) && messages.length > 1) {
      for (const m of messages.slice(0, -1)) {
        if (m.role === 'user') {
          await chat.sendMessage({ message: m.text });
        }
      }
    }

    // Try Gemini API call with a 4-second timeout guard
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), 4000);
    });

    const aiPromise = (async () => {
      const response = await chat.sendMessage({
        message: userText,
      });
      return response.text;
    })();

    const replyText = await Promise.race([aiPromise, timeoutPromise]);
    res.json({ reply: replyText || getSmartFallbackReply(userText) });
  } catch (error: any) {
    console.warn('Gemini chat error/timeout, using fallback:', error?.message);
    const userText = req.body?.message || 'Hello';
    res.json({ reply: getSmartFallbackReply(userText) });
  }
});

// Start Vite in middleware mode
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
