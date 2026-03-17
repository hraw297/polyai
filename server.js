require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── HEALTH CHECK ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    models: {
      gpt:    !!process.env.OPENAI_API_KEY,
      claude: !!process.env.ANTHROPIC_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      grok:   !!process.env.GROK_API_KEY,
    }
  });
});

// ─── GET KEYS ─────────────────────────────────────────────────
app.get('/api/keys', (req, res) => {
  // Only return that keys exist, not the actual values
  res.json({
    openai: process.env.OPENAI_API_KEY ? '***' : '',
    anthropic: process.env.ANTHROPIC_API_KEY ? '***' : '',
    gemini: process.env.GEMINI_API_KEY ? '***' : '',
    grok: process.env.GROK_API_KEY ? '***' : '',
  });
});

// ─── SAVE KEYS ─────────────────────────────────────────────────
app.post('/api/keys', (req, res) => {
  const fs = require('fs');
  const { openai, anthropic, gemini, grok } = req.body;
  
  const envPath = path.join(__dirname, '.env');
  
  // Build .env content
  let envContent = '';
  if (openai) envContent += `OPENAI_API_KEY=${openai}\n`;
  if (anthropic) envContent += `ANTHROPIC_API_KEY=${anthropic}\n`;
  if (gemini) envContent += `GEMINI_API_KEY=${gemini}\n`;
  if (grok) envContent += `GROK_API_KEY=${grok}\n`;
  
  try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    
    // Update current process.env
    if (openai) process.env.OPENAI_API_KEY = openai;
    if (anthropic) process.env.ANTHROPIC_API_KEY = anthropic;
    if (gemini) process.env.GEMINI_API_KEY = gemini;
    if (grok) process.env.GROK_API_KEY = grok;
    
    res.json({ success: true, message: 'Keys saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save keys: ' + err.message });
  }
});

// ─── GPT (OpenAI) PROXY ───────────────────────────────────────
app.post('/api/chat/gpt', async (req, res) => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(400).json({ error: 'OpenAI API key not configured on server.' });

  try {
    const { messages } = req.body;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ model: 'gpt-4o', messages, max_tokens: 1024 }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `OpenAI error: ${err}` });
    }

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CLAUDE (Anthropic) PROXY ─────────────────────────────────
app.post('/api/chat/claude', async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(400).json({ error: 'Anthropic API key not configured on server.' });

  try {
    const { messages } = req.body;
    const msgs = messages.map(m => ({
      role:    m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, messages: msgs }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `Anthropic error: ${err}` });
    }

    const data = await response.json();
    res.json({ reply: data.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GEMINI (Google) PROXY ────────────────────────────────────
app.post('/api/chat/gemini', async (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(400).json({ error: 'Gemini API key not configured on server.' });

  try {
    const { messages } = req.body;
    const contents = messages.map(m => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `Gemini error: ${err}` });
    }

    const data = await response.json();
    res.json({ reply: data.candidates[0].content.parts[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GROK (xAI) PROXY ────────────────────────────────────────
app.post('/api/chat/grok', async (req, res) => {
  const key = process.env.GROK_API_KEY;
  if (!key) return res.status(400).json({ error: 'xAI/Grok API key not configured on server.' });

  try {
    const { messages } = req.body;
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ model: 'grok-3', messages, max_tokens: 1024 }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `xAI error: ${err}` });
    }

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── FALLBACK → serve frontend ────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── START ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 PolyAI server running at http://localhost:${PORT}`);
  console.log(`   GPT:    ${process.env.OPENAI_API_KEY    ? '✓ key set' : '✗ no key'}`);
  console.log(`   Claude: ${process.env.ANTHROPIC_API_KEY ? '✓ key set' : '✗ no key'}`);
  console.log(`   Gemini: ${process.env.GEMINI_API_KEY    ? '✓ key set' : '✗ no key'}`);
  console.log(`   Grok:   ${process.env.GROK_API_KEY      ? '✓ key set' : '✗ no key'}\n`);
});