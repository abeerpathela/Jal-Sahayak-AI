# Jal Sahayak AI

Jal Sahayak AI is an AI-driven complaint management and citizen support platform built using the **MERN stack (MongoDB, Express.js, React.js, Node.js)**. The platform helps citizens resolve water service related issues and access information regarding **water supply, water quality, government schemes, and service complaints** under the Jal Shakti department.

The system integrates an **AI-powered chatbot** that attempts to resolve user queries instantly using a knowledge base. If the AI cannot solve the issue, the complaint is automatically escalated to a **human respondent**, ensuring efficient communication between citizens and the department.

---

## 🚀 Features

* AI-powered chatbot for water service queries
* Complaint registration system
* Automatic escalation to human respondents
* Real-time chat using Socket.io
* Priority classification (High / Medium / Low) using AI
* Google authentication for secure login
* Complaint tracking for citizens
* Dashboard for respondents to manage complaints
* Ability to reopen and resolve complaints
* Feedback system after issue resolution

---

## Preview

<img width="1907" height="901" alt="image" src="https://github.com/user-attachments/assets/98264bfb-514c-4aec-a04c-b09879938d78" />
<img width="1919" height="904" alt="image" src="https://github.com/user-attachments/assets/391d9485-a539-48ff-b962-6280c4c4bcea" />
<img width="1919" height="908" alt="image" src="https://github.com/user-attachments/assets/74a6fd0a-f52b-42bc-abfd-4adb3b3fd5db" />
<img width="1919" height="924" alt="image" src="https://github.com/user-attachments/assets/ff23ed96-5c16-409a-965e-e22336b70e33" />
<img width="1919" height="904" alt="image" src="https://github.com/user-attachments/assets/7b2503aa-e823-4a91-9972-dc1bae0f3826" />
<img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/c023274f-28ca-4987-af2c-8948ac85c4cb" />
<img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/0a9dde73-e018-421e-92f9-3d980a002d8f" />
<img width="1918" height="920" alt="image" src="https://github.com/user-attachments/assets/ff6ea0f8-830a-46b2-bbd0-39761f9a9376" />









---

## 👥 User Roles

### Citizen (Customer)

* Chat with AI assistant
* File complaints with description and optional image
* Track complaint status
* View previous complaints
* Reopen resolved complaints
* Provide feedback after resolution

### Respondent (Department Staff)

* View complaint dashboard
* Search complaints by complaint number
* Access full conversation history
* Communicate with citizens via chat
* Mark complaints as resolved or reopen them

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Socket.io Client

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.io

### Integrations

* Google OAuth Authentication
* Cloudinary (Image uploads)
* AI API for chatbot intelligence

---

## 📂 Project Structure

backend/
controllers/
middleware/
models/
routes/
services/
server.js

frontend/
src/
components/
pages/
services/

---

## ⚙️ Environment Variables

Create a `.env` file inside the backend directory and add:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

---

## ▶️ Running the Project Locally

1. Clone the repository

git clone https://github.com/yourusername/jal-sahayak-ai.git
cd jal-sahayak-ai

2. Install dependencies

Backend

cd backend
npm install

Frontend

cd frontend
npm install

3. Start the backend

npm run dev

4. Start the frontend

npm run dev

Frontend will run on:
http://localhost:5173

Backend will run on:
http://localhost:5000

---

## 🌐 Deployment

Deployment is currently **in progress** and will be added soon.

Planned deployment:

Frontend → Vercel
Backend → Render
Database → MongoDB Atlas

---

## 🎯 Project Goal

The goal of Jal Sahayak AI is to improve communication between citizens and water service authorities by providing **fast AI-based assistance, structured complaint management, and efficient issue resolution**.

---

## 📌 Future Improvements

* AI sentiment detection for complaints
* Smart complaint summarization
* Advanced analytics dashboard
* Multilingual chatbot support
* Mobile-friendly interface

---

## 👨‍💻 Author

Developed as part of a project to improve public service accessibility using AI and modern web technologies.
