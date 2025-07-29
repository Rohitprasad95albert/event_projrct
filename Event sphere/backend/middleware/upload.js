const multer = require('multer');           // Import Multer for handling file uploads
const path = require('path');               // Import path module (optional here but often used for path manipulation)

// Define storage configuration for Multer
const storage = multer.diskStorage({
  // Set the destination folder for uploaded files
  destination: 'uploads/posters',

  // Define how the uploaded file should be named
  filename: (req, file, cb) => {
    // Prefix the original file name with the current timestamp to make it unique
    cb(null, Date.now() + '_' + file.originalname);
  }
});

// Create an upload middleware instance using the defined storage configuration
const upload = multer({ storage });

// Export the upload middleware for use in routes
module.exports = upload;
