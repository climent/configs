import crypto from 'crypto';
if (typeof globalThis.crypto === 'undefined') { globalThis.crypto = crypto; }

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { nanoid } from 'nanoid';
import validUrl from 'valid-url';
import Url from './models/Url.js';

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/urlshortener';
mongoose.connect(mongoURI).then(() => console.log('MongoDB Connected'));

// --- API ROUTES ---

app.post('/api/shorten', async (req, res) => {
  let { longUrl, customCode } = req.body;

  if (!longUrl) return res.status(400).json({ error: 'URL is required' });

  // FEATURE: Auto-add http:// if protocol is missing
  if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
    longUrl = 'http://' + longUrl;
  }
  
  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({ error: 'Invalid original URL format' });
  }

  try {
    let shortCode;

    if (customCode) {
      // REGEX: Only allow letters, numbers, hyphens and underscores.
      const aliasRegex = /^[a-zA-Z0-9\-_]+$/;
      if (!aliasRegex.test(customCode)) {
        return res.status(400).json({ error: 'Invalid alias. Symbols like "/" are not allowed.' });
      }

      const existing = await Url.findOne({ shortCode: customCode });
      if (existing) {
        return res.status(400).json({ error: 'This alias is already taken' });
      }
      shortCode = customCode;
    } else {
      shortCode = nanoid(7);
    }

    const newUrl = new Url({ longUrl, shortCode });
    await newUrl.save();
    res.json(newUrl);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/links', async (req, res) => {
  try {
    const links = await Url.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/links/:code', async (req, res) => {
  try {
    await Url.findOneAndDelete({ shortCode: req.params.code });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- REDIRECT ROUTE ---
app.get('/:code', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code });
    if (url) {
      url.clicks++;
      await url.save();
      return res.redirect(url.longUrl);
    }
    res.status(404).send('URL not found');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.listen(5000, '0.0.0.0', () => console.log('Backend running on port 5000'));
