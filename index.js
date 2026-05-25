const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/auth');
const itemRoutes = require('./src/routes/items');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend/dist')));

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// Catch-all route for React client-side routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  } else {
    next();
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
