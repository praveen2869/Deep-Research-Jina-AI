# 🦸‍♂️ Deep Research - AI-Powered Research Assistant

> **"Assemble your research like the Avengers"** - A powerful AI-driven research tool that helps you discover, analyze, and synthesize information from across the web.

![Avengers Theme](https://img.shields.io/badge/Theme-Avengers-red?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4.1-purple?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.11-teal?style=for-the-badge&logo=tailwindcss)

## 🌟 Overview

Deep Research is a modern web application that combines the power of AI with an intuitive interface to help researchers, students, and professionals gather and analyze information efficiently. With its Avengers-themed design, the app makes research engaging while providing powerful analytical capabilities.

## ✨ Key Features

### 🔍 **Intelligent Web Search**
- **Jina AI Integration**: Leverages Jina AI's search API for comprehensive web discovery
- **Real-time Results**: Fast, accurate search results with detailed metadata
- **Smart Filtering**: Automatically filters and ranks results by relevance

### 📖 **Content Extraction & Reading**
- **Full Content Retrieval**: Extracts complete article content from any URL
- **Clean Reading Experience**: Formatted, distraction-free content viewing
- **Metadata Preservation**: Maintains publication dates, titles, and source information

### 🧠 **AI-Powered Analysis**
- **OpenAI GPT-4 Integration**: Generates comprehensive research reports
- **Multi-Source Synthesis**: Combines insights from multiple sources
- **Structured Output**: Organized summaries, key findings, and recommendations
- **Batch Processing**: Analyze multiple articles simultaneously

### 🎨 **Avengers-Themed UI**
- **Heroic Design**: Marvel-inspired color scheme and animations
- **Character Animations**: Moving Avengers characters for visual appeal
- **Responsive Layout**: Works seamlessly across all device sizes
- **Dark Theme**: Easy on the eyes for extended research sessions

### 🔧 **Advanced Features**
- **API Key Management**: Secure storage of OpenAI API keys
- **Progress Tracking**: Real-time feedback during content fetching and analysis
- **Error Handling**: Robust error management with user-friendly messages
- **Export Capabilities**: Copy and save research findings

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **OpenAI API Key** (for AI analysis features)
- **Internet Connection** (for web search and content retrieval)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/context-explorer-ai-rag.git
   cd context-explorer-ai-rag
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8082`

## 🛠️ Technology Stack

### **Frontend Framework**
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript 5.5.3** - Type-safe development
- **Vite 5.4.1** - Lightning-fast build tool and dev server

### **UI & Styling**
- **TailwindCSS 3.4.11** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful, customizable icons
- **Custom Avengers Theme** - Marvel-inspired design system

### **State Management & Data**
- **TanStack Query 5.56.2** - Powerful data fetching and caching
- **React Hook Form 7.53.0** - Performant form handling
- **Zod 3.23.8** - Schema validation

### **AI & External Services**
- **OpenAI GPT-4** - Advanced language model for content analysis
- **Jina AI Search API** - Web search and content extraction
- **Custom Analysis Pipeline** - Intelligent content processing

### **Development Tools**
- **ESLint** - Code linting and quality assurance
- **TypeScript ESLint** - TypeScript-specific linting rules
- **PostCSS** - CSS processing and optimization

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Radix + custom)
│   ├── SearchBar.tsx    # Search input component
│   ├── SearchResults.tsx # Search results display
│   ├── ContentViewer.tsx # Article content viewer
│   ├── ComprehensiveAnalysis.tsx # AI analysis display
│   └── ApiKeyInput.tsx  # API key management
├── services/            # External API integrations
│   ├── jinaService.ts   # Jina AI search & content extraction
│   └── analysisService.ts # OpenAI analysis pipeline
├── hooks/               # Custom React hooks
│   ├── use-toast.ts     # Toast notification hook
│   └── use-mobile.tsx   # Mobile detection hook
├── pages/               # Application pages
│   ├── Index.tsx        # Main application page
│   └── NotFound.tsx     # 404 error page
├── lib/                 # Utility functions
│   └── utils.ts         # Common utilities
└── assets/              # Static assets and images
```

## 🔧 Configuration

### **API Keys**
The application requires an OpenAI API key for AI analysis features:

1. **Environment Variable** (Recommended for development):
   ```env
   VITE_OPENAI_API_KEY=sk-your-key-here
   ```

2. **Runtime Configuration**:
   Users can input their API key directly in the application interface

### **Build Configuration**
- **Vite Config**: Optimized for React with SWC compiler
- **TypeScript**: Strict mode enabled for better type safety
- **TailwindCSS**: Custom theme with Avengers color palette

## 🎯 Usage Guide

### **Basic Research Workflow**

1. **Search for Topics**
   - Enter keywords or research topics in the search bar
   - Review search results with titles, descriptions, and sources

2. **Read Content**
   - Click "Read Full Content" on any search result
   - View clean, formatted article content in the modal viewer

3. **Generate Analysis**
   - Collect multiple articles by reading their content
   - Click "Generate Analysis" to create AI-powered research reports
   - View comprehensive summaries, key findings, and recommendations

### **Advanced Features**

- **Batch Analysis**: Use "Fetch & Analyze" to automatically process multiple search results
- **Content Management**: Track all fetched articles in the analysis panel
- **Export Options**: Copy analysis results for use in other applications

## 🔒 Security & Privacy

- **API Key Security**: Keys are stored locally and never transmitted to unauthorized services
- **Data Privacy**: No user data is stored on external servers
- **Secure Communications**: All API calls use HTTPS encryption

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Maintain consistent code formatting
- Add tests for new features
- Update documentation as needed
