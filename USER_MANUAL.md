# IronMind OS :: User Manual

## Overview
IronMind OS is a terminal-based interface for tracking fitness and life metrics. It mimics a UNIX-like environment but is optimized for natural language logging and data visualization.

---

## ⌨️ Global Hotkeys
- **`Up Arrow`**: Cycle through previous commands (History).
- **`Down Arrow`**: Cycle forward through history.
- **`Enter`**: Execute command.

---

## 🛠️ Command Reference

### 1. Logging & Tracking
The core of IronMind OS. The AI automatically parses natural language.

| Command | Arguments | Description | Example |
| :--- | :--- | :--- | :--- |
| `/log` | `[text]` | Log a workout session. | `/log Bench Press 225x5, Squat 315x5` |
| `/weight` | `[number]` | Log bodyweight. | `/weight 185.5` |
| `/cardio` | `[text]` | Log cardio activity. | `/cardio ran 5k in 25 mins` |
| `/food` | `[text]` | Log nutrition. | `/food 200g chicken breast and rice` |
| `/habit` | `[name]` | Mark a habit as done. | `/habit meditation` |
| `/mood` | `[1-10]` | Log daily mood. | `/mood 8` |
| `/sleep` | `[hours]` | Log hours slept. | `/sleep 7.5` |
| `/note` | `[text]` | Save a general note. | `/note felt strong today` |

### 2. Data Retrieval & Visualization
View your progress.

| Command | Arguments | Description | Example |
| :--- | :--- | :--- | :--- |
| `/view` | `analytics` | Open the full Analytics Dashboard. | `/view analytics` |
| `/generate` | `weight` | Overlay a weight trend chart. | `/generate weight` |
| `/generate` | `activity` | Overlay activity consistency chart. | `/generate activity` |
| `/stats` | - | Show text summary of recent stats. | `/stats` |
| `/history` | - | Shortcut to Analytics page. | `/history` |
| `/export` | - | Download all data as JSON. | `/export` |

### 3. System & Customization
Make the OS yours. Settings are saved to your profile.

| Command | Arguments | Description | Example |
| :--- | :--- | :--- | :--- |
| `/color` | `[hex]` | Set system accent color. | `/color #ff00ff` |
| `/bgcolor` | `[hex]` | Set terminal background color. | `/bgcolor #1a1a1a` |
| `/spacing` | `[size]` | Adjust line/layout spacing. | `/spacing 1.5rem` |
| `/fontsize` | `[size]` | Adjust text size. | `/fontsize 18px` |
| `/clear` | - | Clear the terminal screen. | `/clear` |
| `/mode` | `chat` \| `command` | Toggle AI Chat Mode. | `/mode chat` |

### 4. AI & Extras
Fun and utility commands.

| Command | Arguments | Description | Example |
| :--- | :--- | :--- | :--- |
| `/ask` | `[question]` | Ask AI a health question. | `/ask typical macros for cutting?` |
| `/roast` | - | Ask AI to roast your stats. | `/roast` |
| `/quote` | - | Get a motivational quote. | `/quote` |
| `/coinflip` | - | Heads or Tails? | `/coinflip` |
| `/man` | `[cmd]` | Show this manual for a command. | `/man log` |

---

## 📱 Mobile PWA Guide

1.  **Install**: Open in Safari (iOS) or Chrome (Android). Tap "Share" -> "Add to Home Screen".
2.  **Layout**: The input bar is automatically moved to the **top** of the screen for better typing ergonomics.
3.  **Keyboard**: The virtual keyboard will not obscure the input field.

## 💾 Troubleshooting

- **"Hydration Error"**: Reload the page. This usually fixes itself (time check sync).
- **"Network Error"**: Ensure your device is online. If local, ensure the server is running.
- **AI Not Replying**: Check if the local AI server (LM Studio) is running on port 1234.
