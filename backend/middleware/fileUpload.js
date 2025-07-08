const multer = require("multer");
const path = require("path");
const fs = require("fs");                         //built-in fs (File System) module, The fs module allows you to interact with the file system — reading, writing, deleting, and managing files or directories.

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");  //__dirname refers to the current file's directory (middleware/)&../uploads goes one level up from the current file and then into an uploads folder
if (!fs.existsSync(uploadsDir)) {                       //Checks if the uploads directory already exists synchronously using Node's fs (file system) module.Prevents errors from trying to create a directory that’s already there.
  fs.mkdirSync(uploadsDir, { recursive: true });        //If the directory doesn’t exist, create it synchronously.recursive: true ensures:Any parent directories that don't exist will also be created.
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); //Generates a unique suffix using the current timestamp and a random number to avoid filename collisions.
    const ext = path.extname(file.originalname);                             //Gets the file extension (e.g., .pdf, .jpg)
    const nameWithoutExt = path.basename(file.originalname, ext);            //Gets the file name without extension
    cb(null, nameWithoutExt + "-" + uniqueSuffix + ext);
  },
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {            //This function is passed to multer to filter files during upload[file — the file being uploaded (includes mimetype, originalname, etc.)]
  const allowedTypes = [                           //A list of MIME types you’re allowing
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {     //Checks if the uploaded file's MIME type is in the allowed list
    cb(null, true);                               //Accepts the file — null means no error, true tells multer to continue processing this file
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, and image files are allowed."
      ),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {              //Multer throws instances of MulterError for upload-related issues, such as:LIMIT_FILE_SIZE,LIMIT_FILE_COUNT,LIMIT_UNEXPECTED_FILE
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size allowed is 10MB.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field.",
      });
    }
    return res.status(400).json({
      success: false,
      message: "File upload error: " + error.message,
    });
  }

  if (error.message.includes("Invalid file type")) {               //error.message.includes("Invalid file type")->include the phrase "Invalid file type" inside the error message.This matches what you return in your fileFilter. Ex: "Invalid file type. Only PDF, DOC, ... are allowed."
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
};

module.exports = {
  upload,
  handleMulterError,
};