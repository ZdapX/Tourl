
const express = require('express');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// Konfigurasi Cloudinary kamu
cloudinary.config({
  cloud_name: 'dnb0q2s2h',
  api_key: '838368993294916',
  api_secret: 'N9U1eFJGKjJ-A8Eo4BTtSCl720c',
});

// Fungsi untuk menentukan resource_type berdasarkan ekstensi
function getResourceType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const images = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const videos = ['mp4', 'mov', 'avi', 'mkv'];
  if (images.includes(ext)) return 'image';
  if (videos.includes(ext)) return 'video';
  return 'raw'; // Untuk pdf, zip, doc, dll
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'public_uploads',
    // Kita paksa format resource_type-nya terdeteksi di sini
    resource_type: (req, file) => {
        const type = getResourceType(file.originalname);
        return type;
    },
    public_id: (req, file) => {
        // Kita beri nama file unik
        return 'file-' + Date.now();
    }
  },
});

const upload = multer({ storage: storage });

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

// ROUTE UPLOAD
app.post('/upload', upload.single('media'), (req, res) => {
  try {
    if (!req.file) return res.status(400).send('File gagal diupload.');

    // Ambil info dari file yang berhasil diupload
    // req.file.path biasanya berisi URL lengkap Cloudinary
    const fileUrl = req.file.path;
    const resourceType = getResourceType(req.file.originalname);
    
    // Ambil ID filenya saja (contoh: file-123456)
    const fileNameOnCloud = req.file.filename.split('/').pop();
    const extension = req.file.originalname.split('.').pop();

    // Buat link pendek versi Vercel kamu
    // Format: domain.com/tipe/namafile.ext
    const shortUrl = `${req.protocol}://${req.get('host')}/s/${resourceType}/${fileNameOnCloud}.${extension}`;

    res.render('result', { url: shortUrl });
  } catch (error) {
    res.status(500).send('Error backend: ' + error.message);
  }
});

// ROUTE REDIRECT (PENGGANTI DATABASE)
// Kita tangkap tipe dan nama filenya langsung dari URL
app.get('/s/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  
  // Konstruk URL asli Cloudinary secara manual agar tidak 'undefined'
  // Format Cloudinary: https://res.cloudinary.com/[cloud_name]/[type]/upload/public_uploads/[filename]
  const originalUrl = `https://res.cloudinary.com/dnb0q2s2h/${type}/upload/public_uploads/${filename}`;
  
  res.redirect(originalUrl);
});

module.exports = app;
