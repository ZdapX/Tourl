const express = require('express');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// Konfigurasi Cloudinary Langsung (Sesuai Request)
cloudinary.config({
  cloud_name: 'dnb0q2s2h',
  api_key: '838368993294916',
  api_secret: 'N9U1eFJGKjJ-A8Eo4BTtSCl720c',
});

// Konfigurasi Penyimpanan ke Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'public_uploads',
    resource_type: 'auto', // Mendukung gambar, video, pdf, dll.
    public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0],
  },
});

const upload = multer({ storage: storage });

// Setting EJS
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Halaman Utama
app.get('/', (req, res) => {
  res.render('index');
});

// Proses Upload
app.post('/upload', upload.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('Pilih file terlebih dahulu!');
    }
    // Kirim URL hasil upload ke halaman result
    res.render('result', { url: req.file.path });
  } catch (error) {
    res.status(500).send('Terjadi kesalahan: ' + error.message);
  }
});

module.exports = app;
