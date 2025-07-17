# 🏠 Hostel Marketplace

A full-stack MERN application for buying and selling items within hostel communities. Students can list items for sale, browse available products, and connect with sellers directly.

![Hostel Marketplace](https://img.shields.io/badge/Status-In%20Development-yellow)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## ✨ Features

### 🔐 Authentication System
- User registration and login
- JWT-based authentication
- Protected routes
- Password hashing with bcrypt

### 📦 Item Management
- Create, read, update, delete items
- Search functionality
- Category filtering
- Price range filtering
- Condition-based filtering
- View tracking

### 🎨 Frontend Features
- Responsive design
- Real-time search with debouncing
- Modern UI/UX
- Mobile-friendly interface
- Loading states and error handling

### 🛡️ Security & Performance
- Input validation
- Error handling
- Owner-only permissions
- Optimized API calls
- Pagination support

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Context API** - State management
- **CSS3** - Styling

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hostel-marketplace.git
   cd hostel-marketplace
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Variables**

   Create `server/.env`:
   ```env
   PORT=3001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

   Create `client/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:3001
   ```

5. **Start the Application**

   **Backend (Terminal 1):**
   ```bash
   cd server
   npm run dev
   ```

   **Frontend (Terminal 2):**
   ```bash
   cd client
   npm start
   ```

6. **Visit the app**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
hostel-marketplace/
├── server/                 # Backend API
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── server.js          # Main server file
│   └── package.json
├── client/                # Frontend React app
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── services/      # API services
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - Get all items (with filters)
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item (protected)
- `PUT /api/items/:id` - Update item (protected)
- `DELETE /api/items/:id` - Delete item (protected)
- `GET /api/items/user/my-items` - Get user's items (protected)

### Available Filters
- `search` - Search in title and description
- `category` - Filter by category
- `minPrice`, `maxPrice` - Price range
- `condition` - Filter by condition
- `page`, `limit` - Pagination

## 🎯 Usage

1. **Register** for a new account
2. **Login** with your credentials
3. **Browse items** on the home page
4. **Search and filter** items by category, price, condition
5. **Create listings** for items you want to sell
6. **Manage your items** in the "My Items" section
7. **Contact sellers** directly through their profiles

## 🚧 Development Status

### ✅ Completed Features
- User authentication system
- Item CRUD operations
- Search and filtering
- Responsive frontend
- API integration

### 🔄 In Progress
- Image upload functionality
- User profiles
- Item details page
- Real-time notifications

### 📋 Planned Features
- Chat system between buyers/sellers
- User ratings and reviews
- Payment integration
- Admin dashboard
- Email notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Author

**mephistohascome** - [GitHub](https://github.com/mephistohascome)

## 🙏 Acknowledgments

- Thanks to all contributors
- MongoDB Atlas for database hosting
- React team for the amazing framework
- Express.js for the robust backend framework

---

## 📞 Support

If you have any questions or run into issues, please:
1. Check the [Issues](https://github.com/mephistohascome/hostel-marketplace/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide as much detail as possible

**Happy coding! 🎉**