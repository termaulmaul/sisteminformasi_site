const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();
const port = 3000;

// Middleware untuk melayani file statis dari folder 'public'
app.use(express.static('public'));

// Middleware untuk memblokir akses langsung ke folder 'assets'
app.use('/assets', (req, res, next) => {
  if (req.path.startsWith('/images')) {
    res.status(403).send('Access Forbidden');
  } else {
    next();
  }
});

// Rute khusus untuk melayani gambar
app.get('/images/*', (req, res, next) => {
  const filePath = path.join(__dirname, 'public', 'assets', req.path);
  res.sendFile(filePath, err => {
    if (err) {
      res.status(404).send('File Not Found');
    }
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Konfigurasi reverse proxy untuk rute '/api'
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:4000', // Gantilah dengan alamat server backend Anda
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Menghapus '/api' dari URL sebelum meneruskannya ke server target
  },
}));

// Menjalankan server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});