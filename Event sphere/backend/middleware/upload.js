const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/posters',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

const upload = multer({ storage });
module.exports = upload;
