#!/bin/bash

# AI Question Paper Generator Frontend - Startup Script
# This script helps set up and run the React frontend

echo "🚀 AI Question Paper Generator Frontend Setup"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Navigate to frontend directory
cd "$(dirname "$0")"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Are you in the frontend directory?"
    exit 1
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cat > .env << 'EOF'
# Frontend Environment Configuration
REACT_APP_API_URL=http://localhost:8000/api/v1
EOF
    echo "📝 Created .env file with default API URL"
    echo "   Edit .env if your backend runs on a different port"
fi

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:8000/api/v1/health > /dev/null; then
    echo "✅ Backend is running and accessible"
else
    echo "⚠️  Backend is not running or not accessible"
    echo "   Make sure to start the backend first:"
    echo "   cd .. && ./start.sh"
    echo ""
    echo "   The frontend will still start, but API calls will fail."
fi

# Start the development server
echo ""
echo "🚀 Starting React development server..."
echo "   Frontend will be available at: http://localhost:3000"
echo "   API documentation at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
