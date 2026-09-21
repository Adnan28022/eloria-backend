const multer = require('multer');

// Use memoryStorage so we can either stream to Cloudinary or convert to base64 Data URL
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jfif', 'image/gif'];
  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp|jfif|gif)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and JFIF are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter 
});

module.exports = upload;
