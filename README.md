# ☕ Coffee Vibe Editor

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

It includes an **AI-powered coding assistant**, a **code editor**, and an **interactive playground** to help developers experiment with code and AI features.

---

# 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 🏗 System Architecture

The AI assistant in this project works through the following architecture:

Frontend (Next.js Chat UI)
↓
/api/chat (Next.js Backend API Route)
↓
Ollama Local API
http://localhost:11434/api/generate

↓
TinyLlama AI Model
↓
AI Response Returned to UI


### Flow Explanation

**1️⃣ Frontend (Next.js Chat UI)**  
The user sends a message from the chat interface.

**2️⃣ Backend API Route (`/api/chat`)**  
The Next.js server receives the message and prepares the prompt with the conversation history.

**3️⃣ Ollama Local API**  
The backend sends a request to the local Ollama server running at:
http://localhost:11434/api/generate


**4️⃣ TinyLlama Model**  
Ollama processes the request using the TinyLlama model and generates an AI response.

**5️⃣ Response to UI**  
The generated response is returned to the frontend and displayed in the chat interface.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 📸 Project Screenshots

### 🔥 Dashboard
<img src="https://raw.githubusercontent.com/PRANAYKHOJARE/coffee-vibe-editor/main/screenshots/1.png" width="900"/>

### 🎮 Playground
<img src="https://raw.githubusercontent.com/PRANAYKHOJARE/coffee-vibe-editor/main/screenshots/2.png" width="900"/>

### 🧠 AI Integration
<img src="https://raw.githubusercontent.com/PRANAYKHOJARE/coffee-vibe-editor/main/screenshots/4.png" width="900"/>

### 💻 Code Editor
<img src="https://raw.githubusercontent.com/PRANAYKHOJARE/coffee-vibe-editor/main/screenshots/3.png" width="900"/>
