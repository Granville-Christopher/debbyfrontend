const express = require('express');
const path = require('path');
const app = express();

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - send all requests to index.html for client-side routing
app.use((req, res, next) => {
  // Skip API routes or static files
  if (req.path.startsWith('/api') || req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});