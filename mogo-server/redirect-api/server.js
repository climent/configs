import express from 'express';
import mongoose from 'mongoose';
import Url from './models/Url.js';

const app = express();
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/urlshortener');

// The regex catches everything, including paths with multiple slashes
app.get(/^(.*)$/, async (req, res) => {
  try {
    // req.params[0] will contain the path (e.g., "/folder/sub")
    let path = req.params[0];
    if (path.startsWith('/')) path = path.substring(1);
    
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
