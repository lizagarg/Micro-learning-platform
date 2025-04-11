# Microlearning Platform

A full-stack web application for delivering bite-sized educational content. Built with React, Express, MongoDB, and JWT authentication.

## Features

- User authentication with JWT
- Interactive microlearning lessons
- Progress tracking
- Interactive quizzes and questions
- Responsive design with Tailwind CSS

## Tech Stack

### Frontend
- React.js
- React Router
- Tailwind CSS
- Axios for API calls
- JWT for authentication

### Backend
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd micro-learning-platform
```

2. Install server dependencies:
```
cd server
npm install
```

3. Install client dependencies:
```
cd ../client
npm install
```

4. Create a `.env` file in the server directory:
```
PORT=5000
MONGODB_URI=mongodb+srv://admin:Disha2012@cluster0.fjrmf.mongodb.net/microlearning
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Running the Application

1. Start the server:
```
cd server
npm run dev
```

2. Start the client:
```
cd client
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
micro-learning-platform/
├── client/                   # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React context for global state
│   │   ├── pages/            # Page components
│   │   └── services/         # API services
│   └── ...
├── server/                   # Backend Express application
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Custom middleware
│   │   ├── models/           # Mongoose models
│   │   └── routes/           # API routes
│   └── ...
└── ...
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Lessons
- `GET /api/lessons` - Get all lessons (protected)
- `GET /api/lessons/:id` - Get a specific lesson by ID (protected)

### Progress
- `GET /api/progress/:userId` - Get progress for a user (protected)
- `POST /api/progress` - Update user progress (protected)
