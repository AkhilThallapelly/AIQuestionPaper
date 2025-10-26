# AI Question Paper Generator - Frontend

A modern React.js frontend built with TypeScript and Material-UI for the AI Question Paper Generator application. This frontend provides an intuitive interface for generating, viewing, and managing question papers using the FastAPI backend.

## 🚀 Features

### Core Functionality

- **Interactive Paper Generation**: Easy-to-use form for configuring question papers
- **Real-time Preview**: View generated papers immediately
- **Answer Key Generation**: Generate comprehensive answer keys
- **Question Replacement**: Replace individual questions while maintaining structure
- **PDF Download**: Download question papers and answer keys as PDFs

### User Experience

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Clean, intuitive interface with Material-UI
- **Real-time Feedback**: Toast notifications for all actions
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Graceful error handling with user-friendly messages

## 🛠️ Technology Stack

- **React 18**: Modern React with hooks and TypeScript
- **TypeScript**: Type-safe development with interfaces
- **Material-UI (MUI)**: Comprehensive React component library
- **React Router**: Client-side routing
- **React Hook Form**: Form management and validation
- **Axios**: HTTP client for API communication
- **jsPDF**: PDF generation
- **React Hot Toast**: Toast notifications

## 📦 Installation & Setup

### Prerequisites

- Node.js 16+ and npm
- Running FastAPI backend (see main README)

### Quick Start

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm start
   ```

4. **Open browser**
   Navigate to `http://localhost:3000`

### Environment Configuration

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## 🎯 Usage

### 1. Generate Question Paper

- Navigate to the "Generate" page
- Fill in the paper configuration:
  - Select education board (CBSE, ICSE, SSC)
  - Enter class level and subject
  - Add chapters to include
  - Set total marks and difficulty level
  - Configure question distribution
- Click "Generate Question Paper"
- Wait for AI to create the paper

### 2. View and Manage Paper

- View the generated paper with all questions
- Toggle answer visibility
- Replace individual questions by clicking "Replace Question"
- Download the paper as PDF

### 3. Generate Answer Key

- Click "Generate Answer Key" from the paper view
- View comprehensive answers for all questions
- Download answer key as PDF

## 🏗️ Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── Header.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── PaperGenerator.tsx
│   │   ├── PaperViewer.tsx
│   │   └── AnswerKeyViewer.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── api.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── .eslintrc.json
```

## 🔧 Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm lint`: Run ESLint
- `npm lint:fix`: Fix ESLint issues
- `npm eject`: Eject from Create React App

## 🎨 Customization

### Styling

The app uses Material-UI for styling. Customize the design by:

- Modifying the theme in `src/index.tsx`
- Using Material-UI's sx prop for custom styling
- Creating custom components with Material-UI

### API Integration

The API service is located in `src/services/api.ts`. Modify this file to:

- Change API endpoints
- Add new API calls
- Modify request/response handling

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Static Hosting

The built files in the `build` directory can be deployed to:

- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Any static hosting service

### Environment Variables for Production

Set the following environment variable in your hosting platform:

```
REACT_APP_API_URL=https://your-backend-url.com/api/v1
```

## 🔗 Integration with Backend

The frontend communicates with the FastAPI backend through REST API calls:

- `POST /api/v1/generate-paper`: Generate question paper
- `POST /api/v1/generate-answers`: Generate answer key
- `POST /api/v1/replace-question`: Replace specific question
- `GET /api/v1/paper/{paper_id}`: Retrieve paper
- `GET /api/v1/papers`: List all papers
- `GET /api/v1/health`: Health check

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**

   - Ensure the backend is running on the correct port
   - Check the `REACT_APP_API_URL` environment variable
   - Verify CORS settings in the backend

2. **PDF Download Not Working**

   - Ensure jsPDF is properly installed
   - Check browser console for errors
   - Verify paper data is loaded correctly

3. **TypeScript Errors**
   - Run `npm run lint` to check for type errors
   - Ensure all imports are properly typed
   - Check that API types match backend schemas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
