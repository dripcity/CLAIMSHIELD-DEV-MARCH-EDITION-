#!/bin/bash

# ClaimShield DV - Clerk Webhook Setup Helper
# This script helps you set up the Clerk webhook by automating the ngrok part

echo "🔧 ClaimShield DV - Clerk Webhook Setup"
echo "========================================"
echo ""

# Check if dev server is running
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Dev server is not running on port 3000"
    echo ""
    echo "Please start it in another terminal:"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo "✅ Dev server is running on port 3000"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "⚠️  ngrok is not installed"
    echo ""
    echo "Install it with:"
    echo "  npm install -g ngrok"
    echo "  # or"
    echo "  brew install ngrok"
    echo ""
    exit 1
fi

echo "✅ ngrok is installed"
echo ""

# Start ngrok
echo "🚀 Starting ngrok tunnel..."
echo ""
echo "This will expose your local server to the internet."
echo "Keep this terminal open while setting up the webhook."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run ngrok and capture the URL
ngrok http 3000 --log=stdout | while read line; do
    if echo "$line" | grep -q "url=https://"; then
        NGROK_URL=$(echo "$line" | grep -o 'url=https://[^[:space:]]*' | cut -d'=' -f2)
        echo "✅ Your ngrok URL: $NGROK_URL"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "📋 NEXT STEPS:"
        echo ""
        echo "1. Go to: https://dashboard.clerk.com"
        echo "2. Select your ClaimShield DV application"
        echo "3. Go to: Webhooks → Add Endpoint"
        echo "4. Enter this URL:"
        echo ""
        echo "   $NGROK_URL/api/webhooks/clerk"
        echo ""
        echo "5. Subscribe to these events:"
        echo "   ✓ user.created"
        echo "   ✓ user.updated"
        echo "   ✓ user.deleted"
        echo ""
        echo "6. Click 'Create'"
        echo "7. Copy the 'Signing Secret' (starts with whsec_)"
        echo "8. Add it to your .env.local:"
        echo ""
        echo "   CLERK_WEBHOOK_SECRET=\"whsec_...\""
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "⏳ Keeping tunnel open... Press Ctrl+C to stop"
        echo ""
    fi
    echo "$line"
done
