# 📚 Study Assistant

Study Assistant is an AI-powered web application that helps students generate study materials from a topic or notes. It creates flashcards, quizzes, and study summaries using the Groq API. Users can also refine previously generated study material using natural language instructions.

## ✨ Features

- Generate study material from any topic or notes
- Interactive flashcards
- AI-generated multiple-choice quizzes
- Study overview with summaries and checklists
- Refine generated study material using AI
- Responsive and modern user interface

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express.js

### AI
- Groq API
- Llama 3.3 70B Versatile


## 🚀 Setup
https://github.com/rachanakadlewad-oss/study-assistant

### Prerequisites

- Node.js (v18 or later)
- npm
- Groq API Key

### Clone the Repository

```bash
git clone <your-repository-url>
cd study-assistant
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file inside the `server` folder.

```env
PORT=3002
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

### Run the Backend

```bash
cd server
npm start
```

### Run the Frontend

```bash
cd client
npm run dev
```

Open the application at:

http://localhost:5173

## 💻 Usage

1. Enter a topic or paste your study notes.
2. Click **Generate Study Set**.
3. Explore the generated Flashcards, Quiz, and Overview.
4. Use the **Refine** feature to update the generated study material with your instructions.


## 🤖 AI Usage

This project uses the **Groq API** with the **Llama 3.3 70B Versatile** model to:

- Generate flashcards
- Create quizzes
- Produce study summaries
- Refine existing study material based on user feedback

## ⚠️ Limitations

- Requires a Groq API key.
- Internet connection is required.
- AI-generated responses may occasionally be inaccurate.

## ⏱️ Time Spent

| Task | Time |
|------|------:|
| Project Setup | 0.5 hour |
| Backend Development | 2 hours |
| Frontend Development | 2.5 hours |
| AI Integration | 1 hour |
| UI Improvements | 1 hour |
| Testing & Debugging | 1 hour |

**Total Time:** **8 Hours**

