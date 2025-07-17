// server/config/cloudinary.js - FIXED VERSION
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Make sure environment variables are loaded
dotenv.config();

// Debug: Log the actual values to verify they're loaded
console.log('🔧 Cloudinary Config Debug:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING');

// Configure Cloudinary with explicit values
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Always use HTTPS
});

// Test the configuration
try {
  const testConfig = cloudinary.config();
  console.log('✅ Cloudinary configured with cloud_name:', testConfig.cloud_name);
} catch (error) {
  console.error('❌ Cloudinary configuration error:', error);
}

// Configure multer to store files in memory (not disk)
const storage = multer.memoryStorage();

// Create multer upload middleware
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Function to upload image to Cloudinary
export const uploadToCloudinary = async (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    console.log('🔧 Starting Cloudinary upload for:', filename);
    
    // Verify config before upload
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      console.error('❌ Cloudinary config missing:', {
        cloud_name: !!config.cloud_name,
        api_key: !!config.api_key,
        api_secret: !!config.api_secret
      });
      reject(new Error('Cloudinary configuration is incomplete'));
      return;
    }

    const uploadOptions = {
      folder: 'hostel-marketplace',
      public_id: filename,
      resource_type: 'image',
      transformation: [
        {
          width: 800,
          height: 600,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto'
        }
      ]
    };

    console.log('🔧 Upload options:', uploadOptions);

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Cloudinary upload success:', {
            url: result.secure_url,
            public_id: result.public_id
          });
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// Function to delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;