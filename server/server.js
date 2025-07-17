import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { upload, uploadToCloudinary } from './config/cloudinary.js';
import auth from './middleware/auth.js'; // Import the auth middleware
import User from './models/User.js'; // Import the User model

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Environment check
console.log('🔧 Environment Check:');
console.log('CLOUDINARY_CLOUD_NAME:', !!process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', !!process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', !!process.env.CLOUDINARY_API_SECRET);
console.log('JWT_SECRET:', !!process.env.JWT_SECRET);

// Item Schema (keep this in server.js for now)
const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Books', 'Electronics', 'Furniture', 'Clothing', 'Kitchen Items', 'Sports Equipment', 'Stationery', 'Decoration', 'Others']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  imageUrl: {
    type: String,
    default: ''
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

// REMOVE THE DUPLICATE AUTH MIDDLEWARE FROM HERE - IT'S NOW IMPORTED

// Test routes
app.get('/', (req, res) => {
  console.log('✅ Health check hit!');
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

app.post('/test', (req, res) => {
  console.log('✅ Test route hit with body:', req.body);
  res.json({ 
    message: 'Test successful', 
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

// Test auth route
app.get('/api/test-auth', auth, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Authentication working',
    user: req.user 
  });
});

// Registration route
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt:', req.body);
    
    const { name, email, password } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields',
        received: { name: !!name, email: !!email, password: !!password }
      });
    }
    
    // Check if user exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }
    
    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    console.log('👤 Creating user...');
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    console.log('✅ User saved to database');
    
    // Generate token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1d' }
    );
    
    console.log('🎫 Token generated');
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('💥 Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔑 Login attempt:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password required' 
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid password' 
      });
    }
    
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1d' }
    );
    
    console.log('✅ Login successful');
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// ========== ENHANCED IMAGE UPLOAD ROUTES ==========

// Upload multiple images with better error handling
app.post('/api/upload/images', auth, (req, res) => {
  upload.array('images', 5)(req, res, async (err) => {
    if (err) {
      console.error('❌ Multer error:', err.message);
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    }

    try {
      console.log('📸 Image upload request:', req.files?.length || 0, 'files');
      console.log('👤 User:', req.user?.name || 'Unknown');

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images uploaded'
        });
      }

      // Check file sizes
      for (let file of req.files) {
        if (file.size > 5 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: `File ${file.originalname} is too large (max 5MB)`
          });
        }
      }

      console.log('📤 Starting Cloudinary uploads...');

      // Upload each file to Cloudinary
      const uploadPromises = req.files.map(async (file, index) => {
        const filename = `item_${Date.now()}_${index}`;
        console.log(`📤 Uploading ${filename}...`);
        return await uploadToCloudinary(file.buffer, filename);
      });

      const uploadedImages = await Promise.all(uploadPromises);

      console.log('✅ All images uploaded successfully:', uploadedImages.length);

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        images: uploadedImages
      });

    } catch (error) {
      console.error('💥 Image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images: ' + error.message
      });
    }
  });
});

// Upload single image
app.post('/api/upload/image', auth, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('❌ Multer error:', err.message);
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    }

    try {
      console.log('📸 Single image upload request');
      console.log('👤 User:', req.user?.name || 'Unknown');

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image uploaded'
        });
      }

      const filename = `item_${Date.now()}`;
      const uploadedImage = await uploadToCloudinary(req.file.buffer, filename);

      console.log('✅ Image uploaded successfully:', uploadedImage.url);

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        image: uploadedImage
      });

    } catch (error) {
      console.error('💥 Image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image: ' + error.message
      });
    }
  });
});

// ========== ITEM MANAGEMENT ROUTES ==========

// Get all items (with search and filtering)
app.get('/api/items', async (req, res) => {
  try {
    console.log('📦 Getting all items with query:', req.query);
    
    const { search, category, minPrice, maxPrice, condition, page = 1, limit = 12 } = req.query;
    
    // Build query object
    let query = { isAvailable: true };
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Filter by condition
    if (condition && condition !== 'All') {
      query.condition = condition;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const items = await Item.find(query)
      .populate('seller', 'name email hostelName contactNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Item.countDocuments(query);

    console.log(`✅ Found ${items.length} items`);

    res.json({
      success: true,
      items,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    });

  } catch (error) {
    console.error('💥 Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items'
    });
  }
});

// Get single item by ID
app.get('/api/items/:id', async (req, res) => {
  try {
    console.log('🔍 Getting item by ID:', req.params.id);
    
    const item = await Item.findById(req.params.id)
      .populate('seller', 'name email hostelName contactNumber');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Increment view count
    await Item.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    
    console.log('✅ Item found and views incremented');

    res.json({
      success: true,
      item
    });

  } catch (error) {
    console.error('💥 Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching item'
    });
  }
});

// Create new item (protected route)
app.post('/api/items', auth, async (req, res) => {
  try {
    console.log('➕ Creating new item:', req.body);
    console.log('👤 User:', req.user.name);
    
    const { title, description, category, price, condition, imageUrl, images } = req.body;

    // Validation
    if (!title || !description || !category || !price || !condition) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: title, description, category, price, condition'
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    const item = new Item({
      title,
      description,
      category,
      price: parseFloat(price),
      condition,
      imageUrl: imageUrl || '',
      images: images || [],
      seller: req.user._id
    });

    await item.save();
    await item.populate('seller', 'name email hostelName contactNumber');
    
    console.log('✅ Item created successfully');

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      item
    });

  } catch (error) {
    console.error('💥 Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating item'
    });
  }
});

// Update item (protected route, owner only)
app.put('/api/items/:id', auth, async (req, res) => {
  try {
    console.log('📝 Updating item:', req.params.id);
    console.log('👤 User:', req.user.name);
    
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user owns the item
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    const { title, description, category, price, condition, imageUrl, isAvailable } = req.body;
    
    // Update fields
    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (category !== undefined) item.category = category;
    if (price !== undefined) item.price = parseFloat(price);
    if (condition !== undefined) item.condition = condition;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;

    await item.save();
    await item.populate('seller', 'name email hostelName contactNumber');
    
    console.log('✅ Item updated successfully');

    res.json({
      success: true,
      message: 'Item updated successfully',
      item
    });

  } catch (error) {
    console.error('💥 Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating item'
    });
  }
});

// Delete item (protected route, owner only)
app.delete('/api/items/:id', auth, async (req, res) => {
  try {
    console.log('🗑️ Deleting item:', req.params.id);
    console.log('👤 User:', req.user.name);
    
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user owns the item
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    await Item.findByIdAndDelete(req.params.id);
    
    console.log('✅ Item deleted successfully');

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });

  } catch (error) {
    console.error('💥 Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting item'
    });
  }
});

// Get user's own items (protected route)
app.get('/api/items/user/my-items', auth, async (req, res) => {
  try {
    console.log('📋 Getting user items for:', req.user.name);
    
    const items = await Item.find({ seller: req.user._id })
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${items.length} items for user`);

    res.json({
      success: true,
      items
    });

  } catch (error) {
    console.error('💥 Get user items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user items'
    });
  }
});

// Get current user info (protected route)
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('💥 Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Start server WITH MongoDB
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel-marketplace';

console.log('🚀 Starting server...');
console.log(`📍 Port: ${PORT}`);
console.log('🔌 Connecting to MongoDB...');

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/`);
      console.log(`📍 Test route: http://localhost:${PORT}/test`);
      console.log(`📍 Test auth: http://localhost:${PORT}/api/test-auth`);
      console.log('');
      console.log('🔐 AUTH ROUTES:');
      console.log(`📍 Register: http://localhost:${PORT}/api/auth/register`);
      console.log(`📍 Login: http://localhost:${PORT}/api/auth/login`);
      console.log(`📍 Get User: http://localhost:${PORT}/api/auth/me`);
      console.log('');
      console.log('📦 ITEM ROUTES:');
      console.log(`📍 Get All Items: http://localhost:${PORT}/api/items`);
      console.log(`📍 Get Single Item: http://localhost:${PORT}/api/items/:id`);
      console.log(`📍 Create Item: http://localhost:${PORT}/api/items`);
      console.log(`📍 Update Item: http://localhost:${PORT}/api/items/:id`);
      console.log(`📍 Delete Item: http://localhost:${PORT}/api/items/:id`);
      console.log(`📍 My Items: http://localhost:${PORT}/api/items/user/my-items`);
      console.log('');
      console.log('📸 IMAGE ROUTES:');
      console.log(`📍 Upload Images: http://localhost:${PORT}/api/upload/images`);
      console.log(`📍 Upload Single Image: http://localhost:${PORT}/api/upload/image`);
      console.log('');
      console.log('🎉 Complete marketplace backend ready!');
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});