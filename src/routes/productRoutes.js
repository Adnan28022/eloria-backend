const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const cloudinary = require('cloudinary').v2;

// Check if Cloudinary is configured
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'eloria-skincare' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Image upload MUST be before /:id to avoid route conflict
router.post('/upload', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        if (hasCloudinary) {
          try {
            return await uploadToCloudinary(file.buffer);
          } catch (cloudErr) {
            console.error('Cloudinary upload error, falling back to data URL:', cloudErr.message);
          }
        }
        // Fallback to data URI if Cloudinary is not configured or fails
        return `data:${file.mimetype || 'image/jpeg'};base64,${file.buffer.toString('base64')}`;
      })
    );

    res.json({
      success: true,
      urls: imageUrls,
      data: { urls: imageUrls }
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

// Public
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin protected
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;
