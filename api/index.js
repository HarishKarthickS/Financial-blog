require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const { body, validationResult } = require('express-validator');

const app = express();
const uploadMiddleware = multer({ dest: 'uploads/' });

const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET || 'defaultsecret';

const corsOptions = {
  credentials: true,
  origin: ['http://localhost:3000', 'https://financial-blog-alpha.vercel.app'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect(process.env.MONGODB_URI, {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const authMiddleware = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json('No token provided');
  }
  jwt.verify(token, secret, (err, info) => {
    if (err) {
      return res.status(401).json('Invalid token');
    }
    req.user = info;
    next();
  });
};

app.post('/register', 
  body('username').isLength({ min: 3 }),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, salt);
      const userDoc = await User.create({ username, password: hashedPassword });
      res.json(userDoc);
    } catch (e) {
      console.log(e);
      res.status(400).json(e);
    }
  }
);

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.status(400).json('Wrong credentials');
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie('token', token).json({ id: userDoc._id, username });
      });
    } else {
      res.status(400).json('Wrong credentials');
    }
  } catch (e) {
    res.status(500).json(e);
  }
});

app.get('/profile', authMiddleware, (req, res) => {
  res.json(req.user);
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').json('ok');
});

app.post('/post', authMiddleware, uploadMiddleware.single('file'), async (req, res) => {
  try {
    const { title, summary, content, cover } = req.body;
    const postDoc = await Post.create({ title, summary, content, cover, author: req.user.id });
    res.json(postDoc);
  } catch (e) {
    res.status(500).json(e);
  }
});

app.put('/post/:id', authMiddleware, uploadMiddleware.single('file'), async (req, res) => {
  const { id } = req.params;
  try {
    const postDoc = await Post.findById(id);
    if (!postDoc) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (postDoc.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not the author of this post' });
    }
    const updatedPost = await Post.findByIdAndUpdate(id, {
      title: req.body.title,
      summary: req.body.summary,
      content: req.body.content,
      cover: req.body.cover,
    }, { new: true });
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/post', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (e) {
    res.status(500).json(e);
  }
});

app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const postDoc = await Post.findById(id).populate('author', ['username']);
    if (!postDoc) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(postDoc);
  } catch (e) {
    res.status(500).json(e);
  }
});

app.delete('/post/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const postDoc = await Post.findById(id);
    if (!postDoc) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (postDoc.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not the author of this post' });
    }
    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(4000, () => {
  console.log('Server running at http://localhost:4000');
});
