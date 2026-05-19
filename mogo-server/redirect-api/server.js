import express from 'express';
import mongoose from 'mongoose';
import Url from './models/Url.js';

const app = express();
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/urlshortener');

// The "*" catches everything, including paths with multiple slashes
app.get('*', async (req, res) => {
  try {
    // req.path returns "/folder/sub". We remove the leading "/" to match the DB
    const path = req.path.substring(1);
    
    if (!path) return res.redirect('http://admin.mogo/');

    const url = await Url.findOne({ shortCode: path });
    if (url) {
      url.clicks++;
      await url.save();
      return res.redirect(url.longUrl);
    }
    res.status(404).send('<h1>Short link not found</h1>');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.listen(5001, '0.0.0.0');
