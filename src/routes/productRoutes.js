const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Public
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin protected
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

const upload = require('../middleware/uploadMiddleware');
router.post('/upload', authMiddleware, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'No files uploaded' });
  }
  const imageUrls = req.files.map(file => `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${file.filename}`);
  res.json({ success: true, data: { urls: imageUrls } });
});

module.exports = router;
