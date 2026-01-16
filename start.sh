#!/bin/bash
# 🚀 Horizon Café - Start Script

echo "☕ Horizon Café - Authentication System"
echo "========================================"
echo ""

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo ""

# Setup Backend
echo "🔧 Initializing Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check .env
if [ ! -f ".env" ]; then
    echo "⚠️  .env not found. Creating from .env.example..."
    cp .env.example .env
    echo "   📝 Edit .env with your database and email settings!"
    echo "   📍 Required:"
    echo "      - DATABASE_URL"
    echo "      - JWT_SECRET"
    echo "      - EMAIL_USER"
    echo "      - EMAIL_PASSWORD"
fi

echo "✅ Backend ready!"
echo ""

# Frontend info
echo "🌐 Frontend Setup:"
echo "   Option 1 (Simple):"
echo "     → Open: src/index.html in browser"
echo ""
echo "   Option 2 (With Server):"
echo "     → cd src && python -m http.server 3000"
echo "     → Visit: http://localhost:3000"
echo ""

echo "========================================"
echo "🎯 Ready to start!"
echo ""
echo "To begin:"
echo ""
echo "Terminal 1 (Backend):"
echo "  $ cd backend && npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  $ cd src && python -m http.server 3000"
echo "  Or just open src/index.html"
echo ""
echo "========================================"
echo ""
echo "Documentation:"
echo "  📚 QUICK_START.md - 5 minute setup"
echo "  📖 AUTHENTICATION_GUIDE.md - Full guide"
echo "  📋 IMPLEMENTATION_SUMMARY.md - What was done"
echo ""
echo "Good luck! ☕"
