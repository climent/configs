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

mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/urlshortener');

// Create a new link
app.post('/api/shorten', async (req, res) => {
  let { longUrl, customCode } = req.body;
  if (!longUrl) return res.status(400).json({ error: 'URL is required' });

  // Auto-add http://
  if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
    longUrl = 'http://' + longUrl;
  }
  
  if (!validUrl.isUri(longUrl)) return res.status(400).json({ error: 'Invalid URL format' });

  try {
    let shortCode = customCode || nanoid(7);
    
    // Clean slashes: remove leading/trailing but keep middle ones
    shortCode = shortCode.replace(/^\/+|\/+$/g, '');

    const aliasRegex = /^[a-zA-Z0-9\-_/]+$/;
    if (!aliasRegex.test(shortCode)) {
      return res.status(400).json({ error: 'Invalid alias characters' });
    }

    const existing = await Url.findOne({ shortCode });
    if (existing) return res.status(400).json({ error: 'Alias already taken' });

    const newUrl = new Url({ longUrl, shortCode });
    await newUrl.save();
    res.json(newUrl);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List all links
app.get('/api/links', async (req, res) => {
  const links = await Url.find().sort({ createdAt: -1 });
  res.json(links);
});

// Delete a link (handles slashes in the param)
app.delete('/api/links/*', async (req, res) => {
  try {
    const shortCode = req.params[0]; 
    await Url.findOneAndDelete({ shortCode });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(5000, '0.0.0.0', () => console.log('Admin API running on 5000'));
