# FinCoach Community Edition 🌟
### Free Wealth & Ledger Assistant (Fully Offline Capable)

FinCoach is an elegant, responsive web application for managing cashflows, budgets, savings goals, and debts. It is powered by a high-performance **full-stack React & Node.js (Express)** architecture designed to compile and run seamlessly on your **local machine (`localhost`)**. 

---

## 🚀 Key Offline Design Architecture
To keep this software **100% free with zero cloud billing requirements**, the application operates with a **dual-engine design**:
1. **Offline Mode (Default)**: If no database or AI Keys are provided, FinCoach automatically falls back to secure, client-side browser **LocalStorage** to persist your transactions, savings goals, and budgets. It uses high-efficiency **local heuristic classification and financial analytics engines** written in clean TypeScript/JavaScript to instantly categorize your text prompts and generate helpful coaching suggestions locally.
2. **Hybrid Cloud Mode (Optional)**: If you are online and decide to set up a free Google Gemini developer key, you can activate the advanced Gemini 3.5-flash categorizers and behavioral economic coaching models.

---

## 🛠️ Step-by-Step Local Setup Guide

Follow these steps to run FinCoach on your computer's `localhost`:

### 1. Prerequisites
Make sure you have **Node.js** installed on your system:
* **Download & Install**: [Get Node.js LTS](https://nodejs.org) (this automatically includes the `npm` package manager).

### 2. Export the Project
1. Open the settings menu inside your **Google AI Studio** workspace.
2. Click **Export as ZIP** or link to your **GitHub** account to clone or download the clean code files.
3. Unpack the downloaded `.zip` file on your computer.

### 3. Install Dependencies
Open your system's Command Prompt, Terminal, or PowerShell inside the unzipped directory, and install the local packages:
```bash
npm install
```

### 4. Run the Local Development Server
Launch the unified server using the dynamic TypeScript execution script:
```bash
npm run dev
```
🎉 The terminal will output that the server is running. Open your browser and go to:
* **[http://localhost:3000](http://localhost:3000)**

---

## ⚡ Build and Run in Production Mode (Highly Recommended)
For peak performance, minimal memory footprints, and instant responsive load times on your machine:

1. **Optimize and Bundle Compile**:
   ```bash
   npm run build
   ```
2. **Launch the Server**:
   ```bash
   npm start
   ```

---

## 🔮 Optional: Activate Cloud AI Features (No Google Workspace Billing)
If you wish to use cloud AI models instead of the offline classification engine, you can generate a **100% free-tier Gemini API key**:
1. Go to **[Google AI Studio](https://aistudio.google.com/)** and click **Get API Key**.
2. Create a `.env` file in your root folder:
   ```env
   GEMINI_API_KEY=your_free_api_key_here
   ```
3. Restart your server. FinCoach will detect the key and upgrade to deep economic model generation. If the key is not defined, it silently fallbacks to offline mode instantly.

---

### Enjoy absolute privacy and local data residency with FinCoach Community! 💸
