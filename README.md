# IronMind OS

![IronMind OS Badge](https://img.shields.io/badge/IronMind-OS-22c55e?style=for-the-badge)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

> **"The OS for your gains."**

IronMind OS is a **Cyberpunk Terminal-based Fitness Operating System** designed to track your workouts, biometrics, and habits with the speed and aesthetic of a hacker's console. It features a rich command-line interface, AI-powered logging, and data visualization.

## 🚀 Features

### 🖥️ Terminal Interface
- **Command-Driven**: 100% keyboard-centric workflow.
- **Natural Language Parsing**: Log workouts like "Bench 225x5" and let AI handle the structured data.
- **History & navigation**: Up/Down arrow history navigation, just like ZSH/Bash.
- **Man Pages**: Built-in documentation via `/man [command]`.

### 🧠 AI Intelligence
- **Smart Logging**: Automatically parses macros from food logs (`/log pizza`) and stats from cardio (`/log run 5k`).
- **Chat Mode**: Toggle `/mode chat` to converse with an AI coach.
- **Feedback**: Immediate detailed feedback on parsed calories, protein, and volume.

### 🎨 Personalization
- **Deep Theming**: Customize every aspect with commands.
    - `/color #ff0055`
    - `/bgcolor #000000`
    - `/spacing 1.5rem`
    - `/fontsize 18px`
- **Persistence**: Your theme follows you across sessions and devices.

### 📊 Data & Visualization
- **Analytics Dashboard**: View long-term trends via `/view analytics` or `/history`.
- **ASCII & Charts**: Visual graphs generated on demand.

### 📱 Mobile PWA
- **Installable**: Add to Home Screen for a native app experience.
- **Optimized Layout**: "Input-Top" design for mobile typing ergonomics.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Custom CSS Variables
- **Database**: SQLite (via Prisma)
- **Authentication**: NextAuth.js
- **State Management**: React Hooks + URL State
- **TUI**: Ink (for the CLI version)

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/YOUR_USERNAME/ironmind-os.git
    cd ironmind-os
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Initialize Database**
    ```bash
    npx prisma generate
    npx prisma db push
    npm run seed
    ```

4.  **Start Development Server**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000` to access the terminal.

## 🏗️ Building Standalone Apps

### Desktop App (macOS/Windows/Linux)
IronMind OS uses Electron to wrap the web interface into a native desktop application.

1.  **Build the App**
    ```bash
    npm run dist
    ```
    - This will generate a `.dmg` (macOS), `.exe` (Windows), or `.AppImage` (Linux) in the `dist/` folder.
    - *Note: On macOS, you may need to go to System Settings > Privacy & Security to open the unsigned app.*

### Mobile App (PWA)
1.  Open the deployed URL (or local network IP) on your phone.
2.  **iOS (Safari)**: Tap Share → "Add to Home Screen".
3.  **Android (Chrome)**: Tap Menu → "Install App".
4.  Launch from your home screen for a fullscreen, native feel.

## ⌨️ Command Cheatsheet

| Command | Usage | Description |
| :--- | :--- | :--- |
| **Logging** | `/log bench 225x5` | Log strength training |
| | `/weight 185` | Log bodyweight |
| | `/cardio 30min run` | Log cardio session |
| | `/food chicken rice` | Log nutrition (auto-macros) |
| **System** | `/color [hex]` | Set accent color |
| | `/fontsize [px]` | Set font size |
| | `/mode chat` | Switch to AI Chat |
| **Data** | `/view analytics` | Open charts dashboard |
| | `/generate weight` | overlay weight chart |
| **Help** | `/help` | List all commands |
| | `/man [cmd]` | Detailed manual for command |

## 📚 Documentation

For a complete list of commands and detailed usage instructions, please refer to the [User Manual](USER_MANUAL.md).

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

*Built with ❤️ and Creatine.*
