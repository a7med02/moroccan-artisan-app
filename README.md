<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Groq_API-AI_Powered-orange?style=for-the-badge" alt="Groq API">
</p>

<h1 align="center">Moroccan Artisan </h1>

<p align="center">
  A premium full-stack web application designed to connect users with authentic Moroccan  artisanal crafts. Powered by Next.js 16, React 19, and advanced AI capabilities via Groq and Gemini.
</p>

##  Overview

The **Moroccan Artisan** is an innovative digital experience aimed at European tourists and global explorers. It facilitates the discovery of immersive farm stays, traditional agricultural experiences, and authentic Moroccan crafts. The application leverages modern web technologies and artificial intelligence to deliver dynamic, localized, and highly interactive user experiences. 


##  Key Features

- **Modern Tech Stack**: Built with the latest Next.js 16 App Router and React 19 for optimal performance, fast page loads, and server-side rendering.
- **Premium UI/UX**: Exquisite design system utilizing Tailwind CSS 4, Radix UI primitives, and custom animations for a fluid, accessible, and responsive interface.
- **AI Integration**:
  - **Groq API**: High-speed AI inference for dynamic content generation and multimodal tasks (including voice transcription via Whisper and intelligent responses).
  - **Gemini API**: Advanced reasoning and natural language processing capabilities.
- **Robust Form Handling**: Powered by `react-hook-form` and `zod` validation for seamless user input.
- **Interactive Dashboards**: Data visualization using `recharts` and resizable layouts with `react-resizable-panels`.

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16, React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4.2, PostCSS |
| **Components** | Radix UI, Lucide React, Embla Carousel |
| **State & Forms**| React Hook Form, Zod |
| **AI Services** | Groq API, Gemini API |
| **Analytics** | Vercel Analytics |

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- Node.js (v22 or higher)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd moroccan-artisan-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   Copy the example environment file and configure your API keys.
   ```bash
   cp .env.example .env
   ```
   *Make sure to populate `GROQ_API_KEY` and `GEMINI_API_KEY` in your `.env` file.*

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

## 📁 Project Structure

- `/app`: Next.js 16 App Router pages and layouts.
- `/components`: Reusable UI components (Radix UI, charts, layouts).
- `/lib`: Utility functions and shared logic.
- `/hooks`: Custom React hooks for state and lifecycle management.
- `/public`: Static assets including images and icons.
- `/styles`: Global CSS and Tailwind configuration.

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the platform, please fork the repository, create a feature branch, and submit a pull request.

