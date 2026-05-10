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

// --- API ROUTES (Must come first) ---

app.post('/api/shorten', async (req, res) => {
  const { longUrl, customCode } = req.body;
  if (!validUrl.isUri(longUrl)) return res.status(401).json('Invalid URL');

  try {
    let shortCode = customCode || nanoid(7);
    
    const existing = await Url.findOne({ shortCode });
    if (existing) return res.status(400).json('Alias already taken');

    const newUrl = new Url({ longUrl, shortCode });
    await newUrl.save();
    res.json(newUrl);
  } catch (err) {
    res.status(500).json('Server error');
  }
});

app.get('/api/links', async (req, res) => {
  try {
    const links = await Url.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json('Server error');
  }
});

app.delete('/api/links/:code', async (req, res) => {
  try {
    await Url.findOneAndDelete({ shortCode: req.params.code });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json('Server error');
  }
});

// --- REDIRECT ROUTE (Must come last) ---

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
