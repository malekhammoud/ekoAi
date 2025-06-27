# EkoPen - Advanced Handwriting Recognition

An intelligent writing tool with real-time handwriting recognition and AI-powered feedback.

## Handwriting Recognition Methods

EkoPen implements multiple handwriting recognition approaches for maximum accuracy:

### 1. Google Cloud Vision API (Most Accurate)
- Uses Google's advanced OCR technology
- Excellent for printed and handwritten text
- Requires `VITE_GOOGLE_AI_API_KEY` in your `.env` file

### 2. AI Vision Analysis (Gemini Pro Vision)
- Leverages AI to understand handwriting context
- Good for complex or stylized handwriting
- Uses the same Google AI API key

### 3. MyScript API (Handwriting Specialist)
- Specialized real-time handwriting recognition
- Excellent for cursive and connected writing
- Requires `VITE_MYSCRIPT_API_KEY` and `VITE_HANDWRITING_API_URL`

### 4. Local Pattern Recognition (Offline Fallback)
- Analyzes stroke patterns and geometry
- Works completely offline
- Provides basic recognition when APIs are unavailable

## Setup Instructions

### 1. Environment Variables
Create a `.env` file with the following:

```env
# Google AI (for Vision API and Gemini)
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# MyScript (optional, for enhanced handwriting recognition)
VITE_MYSCRIPT_API_KEY=your_myscript_api_key_here
VITE_HANDWRITING_API_URL=https://api.myscript.com/v4.0/iink
```

### 2. Getting API Keys

#### Google AI API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Enable the Vision API in your Google Cloud Console

#### MyScript API Key (Optional):
1. Sign up at [MyScript Developer](https://developer.myscript.com/)
2. Create a new application
3. Get your API key from the dashboard

### 3. Recognition Features

- **Real-time Processing**: Recognition happens as you write
- **Multi-method Fallback**: If one method fails, others are tried automatically
- **Stroke Analysis**: Visual overlay shows recognition analysis
- **Console Logging**: Detailed recognition stats in browser console
- **Progressive Text**: Text builds up as you add more strokes

### 4. Canvas Features

- **Drawing Tools**: Pen and eraser with customizable colors and sizes
- **Recognition Overlay**: Toggle to see stroke analysis
- **Export**: Download your handwriting as PNG
- **Touch Support**: Works on tablets and touch devices
- **Keyboard Shortcuts**: P (pen), E (eraser), C (clear), D (download)

## Usage Tips

1. **Write Clearly**: Better handwriting = better recognition
2. **Use Contrast**: Dark pen on light background works best
3. **Check Console**: Recognition details are logged for debugging
4. **Try Different Methods**: If one doesn't work, the system tries others
5. **Enable Overlay**: Use the eye icon to see how strokes are analyzed

## Recognition Accuracy

The system tries recognition methods in this order:
1. Google Vision API (highest accuracy)
2. AI Vision Analysis (good for context)
3. MyScript API (specialized for handwriting)
4. Local Pattern Recognition (basic fallback)

## Development

All recognition logic is in:
- `src/services/handwritingService.ts` - Main recognition service
- `src/hooks/useHandwritingRecognition.ts` - React hook for recognition
- `src/components/CustomCanvas.tsx` - Drawing canvas with recognition features

The system is designed to be extensible - you can easily add new recognition methods by implementing them in the `HandwritingService` class.