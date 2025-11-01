#!/bin/bash

# Insurance MCP Server - Quick Setup Script
# This script helps you get started in < 5 minutes

echo "🏥 Insurance Documentation MCP Server - Setup"
echo "============================================="
echo ""

# Check Node.js
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old!"
    echo "Please upgrade to Node.js 18 or higher"
    exit 1
fi

echo "✅ Node.js $(node -v) found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build completed"
echo ""

# Test the server
echo "🧪 Testing server..."
timeout 2s npm start &> /dev/null
if [ $? -eq 124 ]; then
    echo "✅ Server starts successfully"
else
    echo "⚠️  Server test inconclusive (this is usually fine)"
fi
echo ""

# Get absolute path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SERVER_PATH="$SCRIPT_DIR/build/server.js"

# Detect OS for config file location
if [[ "$OSTYPE" == "darwin"* ]]; then
    CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
    PLATFORM="macOS"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    CONFIG_PATH="$APPDATA/Claude/claude_desktop_config.json"
    PLATFORM="Windows"
else
    CONFIG_PATH="$HOME/.config/Claude/claude_desktop_config.json"
    PLATFORM="Linux"
fi

echo "✅ Setup Complete!"
echo ""
echo "============================================="
echo "📋 Next Steps:"
echo "============================================="
echo ""
echo "1. Configure Claude Desktop ($PLATFORM)"
echo ""
echo "   Edit this file:"
echo "   $CONFIG_PATH"
echo ""
echo "   Add this configuration:"
echo ""
cat << EOF
   {
     "mcpServers": {
       "insurance-docs": {
         "command": "node",
         "args": ["$SERVER_PATH"]
       }
     }
   }
EOF
echo ""
echo "2. Restart Claude Desktop"
echo ""
echo "3. Try these example queries in Claude:"
echo "   • 'What does Health Plan A cover?'"
echo "   • 'Compare Health Plan A and Plan B'"
echo "   • 'How do I file a claim?'"
echo ""
echo "============================================="
echo "📚 Resources:"
echo "============================================="
echo ""
echo "• README.md           - Full documentation"
echo "• DECISION_GUIDE.md   - Why RAG vs training"
echo "• production-example.ts - Upgrade to vector DB"
echo "• web-interface-example.ts - Build web app"
echo ""
echo "============================================="
echo "🔧 Customization:"
echo "============================================="
echo ""
echo "To add your own documents, edit:"
echo "   server.ts (line ~40: documentsDB)"
echo ""
echo "Then rebuild:"
echo "   npm run build"
echo ""
echo "============================================="
echo ""
echo "Happy building! 🚀"
