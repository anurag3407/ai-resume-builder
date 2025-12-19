# AI Resume Builder

An AI-powered resume builder that helps you create ATS-optimized resumes tailored to your target job role. Built with the MERN stack (MongoDB replaced with Firebase) and powered by Google Gemini AI via LangChain.js.

![AI Resume Builder](https://img.shields.io/badge/AI-Powered-blue) ![React](https://img.shields.io/badge/React-19-61DAFB) ![Node.js](https://img.shields.io/badge/Node.js-18+-339933) ![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28)

## 🚀 Features

### Core Features
- **🤖 AI-Powered Enhancement**: Transform your resume using Google Gemini AI
- **📄 PDF Upload & Text Extraction**: Drag-and-drop PDF upload with automatic text extraction
- **🎯 Job Role Optimization**: Tailor your resume for specific job roles
- **📝 Harvard Template**: Professional formatting based on the Harvard resume template
- **✏️ Rich Text Editor**: Edit and customize your enhanced resume
- **📥 PDF Download**: Generate high-quality PDF downloads
- **🔐 Multi-User Authentication**: Secure login with email/password and Google OAuth
- **☁️ Cloud Storage**: All resumes stored securely in Firebase

### Technical Features
- Real-time preview with Markdown support
- ATS (Applicant Tracking System) optimization
- Responsive design for all devices
- Form validation with React Hook Form
- State management with Zustand
- Rate limiting and security middleware
- Error handling and loading states

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite
- **TailwindCSS 4** for styling
- **React Router 7** for navigation
- **Zustand** for state management
- **React Hook Form** for form handling
- **Framer Motion** for animations
- **React Markdown** for preview
- **jsPDF & html2canvas** for PDF generation

### Backend
- **Node.js** with Express.js
- **LangChain.js** with Google Gemini AI
- **Firebase Admin SDK** for backend services
- **Multer** for file uploads
- **pdf-parse** for PDF text extraction
- **Helmet** for security headers
- **express-rate-limit** for rate limiting

### Database & Storage
- **Firebase Firestore** for metadata
- **Firebase Storage** for PDF files
- **Firebase Authentication** for user management

## 📁 Project Structure

```
ai-resume-builder/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── firebase.js      # Firebase Admin SDK setup
│   │   │   └── langchain.js     # LangChain + Gemini configuration
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT verification
│   │   │   ├── errorHandler.js  # Global error handling
│   │   │   └── upload.js        # Multer file upload
│   │   ├── routes/
│   │   │   ├── auth.js          # Authentication routes
│   │   │   ├── enhance.js       # AI enhancement routes
│   │   │   ├── resume.js        # Resume CRUD routes
│   │   │   └── upload.js        # File upload routes
│   │   └── index.js             # Express server entry
│   ├── .env                      # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Layout components
│   │   │   └── ui/              # Reusable UI components
│   │   ├── config/
│   │   │   ├── api.js           # API client
│   │   │   └── firebase.js      # Firebase client setup
│   │   ├── lib/
│   │   │   ├── constants.js     # App constants
│   │   │   └── utils.js         # Utility functions
│   │   ├── pages/               # Page components
│   │   ├── store/               # Zustand stores
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # Entry point
│   ├── .env                      # Frontend environment variables
│   └── package.json
├── firebase/
│   ├── firestore.rules          # Firestore security rules
│   └── storage.rules            # Storage security rules
├── firebase.json                 # Firebase configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore and Storage enabled
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-resume-builder.git
   cd ai-resume-builder
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**

   Backend (`backend/.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Firebase
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-bucket.firebasestorage.app
   
   # Google Gemini API
   GEMINI_API_KEY=your-gemini-api-key
   
   # CORS
   FRONTEND_URL=http://localhost:5173
   ```

   Frontend (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-bucket.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

5. **Start the development servers**

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend (new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📚 API Documentation

### Authentication

#### Verify Token
```http
POST /api/auth/verify
Authorization: Bearer <firebase-id-token>
```

### Resume Upload

#### Upload Resume & Extract Text
```http
POST /api/upload
Authorization: Bearer <firebase-id-token>
Content-Type: multipart/form-data

Body:
  - resume: PDF file (max 5MB)
```

Response:
```json
{
  "success": true,
  "data": {
    "resumeId": "uuid",
    "extractedText": "...",
    "pageCount": 2
  }
}
```

### AI Enhancement

#### Enhance Resume
```http
POST /api/enhance
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "resumeText": "...",
  "preferences": {
    "jobRole": "React Developer",
    "yearsOfExperience": 5,
    "skills": ["React", "TypeScript", "Node.js"],
    "industry": "Technology",
    "customInstructions": ""
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "enhancedResume": "# John Doe\n\n## Summary\n...",
    "tokensUsed": {
      "prompt": 1500,
      "completion": 2000,
      "total": 3500
    }
  }
}
```

### Resume Management

#### Get All Resumes
```http
GET /api/resumes
Authorization: Bearer <firebase-id-token>
```

#### Get Single Resume
```http
GET /api/resumes/:resumeId
Authorization: Bearer <firebase-id-token>
```

#### Create Resume
```http
POST /api/resumes
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "originalText": "...",
  "enhancedText": "...",
  "jobRole": "React Developer",
  "preferences": {...},
  "title": "My Resume"
}
```

#### Update Resume
```http
PUT /api/resumes/:resumeId
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "enhancedText": "...",
  "title": "Updated Title"
}
```

#### Delete Resume
```http
DELETE /api/resumes/:resumeId
Authorization: Bearer <firebase-id-token>
```

## 🔒 Security

- All API endpoints require Firebase Authentication
- File uploads limited to 5MB PDF files only
- Rate limiting: 100 requests per 15 minutes
- Firestore security rules enforce user data isolation
- Storage security rules validate file types and ownership
- CORS configured for specific frontend origin
- Helmet.js for security headers

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider

3. Set environment variables in your hosting dashboard

### Backend (Railway/Heroku)

1. Set environment variables in your hosting dashboard

2. Deploy with:
   ```bash
   git push heroku main
   # or
   railway up
   ```

### Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login and deploy:
   ```bash
   firebase login
   firebase deploy
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://deepmind.google/technologies/gemini/) for AI capabilities
- [LangChain.js](https://js.langchain.com/) for AI orchestration
- [Firebase](https://firebase.google.com/) for backend services
- [Harvard Resume Template](https://www.harvard.edu/) for resume formatting guidelines
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide Icons](https://lucide.dev/) for icons
