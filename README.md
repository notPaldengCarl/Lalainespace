# 🧸 Lalaine — Cozy Productivity Suite

> "Productivity that feels like a warm hug."

Lalaine is a personal dashboard designed to help you organize your life without the stress. It combines essential productivity tools with a cozy, "lo-fi" aesthetic, making it perfect for students, creatives, and anyone who wants a calmer digital workspace.

## ✨ Core Features

### 1. 🍅 Focus Timer (Pomodoro)
- Customizable timer intervals (Focus, Short Break, Long Break).
- Visual circular progress ring.
- Gentle audio notifications.

### 2. 📝 To-Do List
- Categorize tasks by project (Personal, Work, Study, Goals).
- Simple check-off system with deletion confirmations.
- "Task Slayer" achievement integration.

### 3. 📅 Calendar & Events
- **Day Counter:** Automatic countdown to special dates (e.g., "Her Birthday" on April 10).
- **Expandable View:** Open the calendar in full-screen (Notion-style) for better planning.
- **Event Flags:** Mark important events with a distinct red indicator.

### 4. 💸 Budget Tracker
- Track Income vs. Expenses.
- Visual progress bar for spending limit awareness.
- **History View:** Pop-up modal to scroll through your entire transaction history.
- Categories with icons (Food 🍔, Transport 🚗, etc.).

### 5. 🌬️ Rantspace
- A digital void for your stress. Type out your frustrations and "Release" them.
- Visual animation sends your words away and clears the screen.
- Tracks how many rants you've released.

### 6. 📔 Notebook
- Full markdown support (Bold, Italic, Headings, Checklists).
- Folder structure for organizing notes.
- Drag-and-drop organization for pages.
- Preview vs. Edit mode.

### 7. 🤖 Lalaine AI (Chatbot)
- Powered by Gemini API.
- Persona: Warm, supportive, and helpful.
- Suggests breaks, roasting (playfully), and motivation.

### 8. 🎨 Theming
- **Latte:** Default warm beige.
- **Mocha:** Dark mode with high contrast.
- **Sage:** Calming green.
- **Rose:** Soft pink.

### 9. 📱 Responsive Design
- Works as a PWA (Progressive Web App).
- Sidebar tucks away on mobile/tablet for a focused view.
- Touch-friendly controls.

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js installed on your machine.
- A Google Gemini API Key (for the Chatbot).

### Running Locally
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up API Key:**
   - Create a `.env` file (or set in your environment variables):
   ```env
   API_KEY=your_gemini_api_key_here
   ```

3. **Start the app:**
   ```bash
   npm run dev
   ```

### Building for Production
- **Web:** `npm run build`
- **Desktop (Electron):** `npm run dist` (See `BUILD_INSTRUCTIONS.md`)
- **Mobile (Capacitor):** `npx cap sync` (See `BUILD_INSTRUCTIONS.md`)

---

## 💾 Data Persistence
Lalaine uses `localStorage` to save your data (Todos, Events, Habits, Budget, Notes) directly in your browser. No database setup is required, but clearing your browser cache will remove your data.

---

## 🤝 Contributing
Feel free to fork this repository and customize the `constants.tsx` file to change default habits, quick links, or color themes!
