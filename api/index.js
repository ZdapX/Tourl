
const express = require('express');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: 'dnb0q2s2h',
  api_key: '838368993294916',
  api_secret: 'N9U1eFJGKjJ-A8Eo4BTtSCl720c',
});

// Konfigurasi Penyimpanan
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'public_uploads',
    resource_type: 'auto',
    // Kita buat public_id yang unik
    public_id: (req, file) => 'file-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
  },
});

const upload = multer({ storage: storage });

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Halaman Utama
app.get('/', (req, res) => {
  res.render('index');
});

// Proses Upload
app.post('/upload', upload.single('media'), (req, res) => {
  try {
    if (!req.file) return res.status(400).send('Pilih file dulu!');

    /* 
       LOGIKA URL CUSTOM:
       Cloudinary punya 3 tipe: image, video, raw (untuk pdf/zip).
       Kita ambil tipe-nya (req.file.resource_type) dan ID-nya.
    */
    const type = req.file.resource_type; // 'image' atau 'video' atau 'raw'
    const publicId = req.file.filename.replace('public_uploads/', ''); // ambil ID saja
    const extension = req.file.path.split('.').pop(); // ambil ekstensi (.jpg, .mp4, dll)

    // Link yang akan tampil: domain.com/i-fileID.jpg (i untuk image, v untuk video, r untuk raw)
    const typeCode = type === 'image' ? 'i' : (type === 'video' ? 'v' : 'r');
    const customFriendlyUrl = `${req.protocol}://${req.get('host')}/${typeCode}-${publicId}.${extension}`;

    res.render('result', { url: customFriendlyUrl });
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

// ROUTE UNTUK MENANGKAP LINK (Contoh: domain.com/i-file123.jpg)
app.get('/:slug', (req, res) => {
  const slug = req.params.slug;

  // Cek awalan untuk menentukan resource_type Cloudinary
  let folder = 'image';
  if (slug.startsWith('v-')) folder = 'video';
  if (slug.startsWith('r-')) folder = 'raw';

  // Bersihkan ID (hilangkan awalan 'i-', 'v-', atau 'r-')
  const cleanId = slug.substring(2);

  // Redirect langsung ke URL asli Cloudinary
  const finalUrl = `https://res.cloudinary.com/dnb0q2s2h/${folder}/upload/public_uploads/${cleanId}`;
  
  res.redirect(finalUrl);
});

module.exports = app;
