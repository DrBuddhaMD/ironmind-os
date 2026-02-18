import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export type CommandLog = string;

export type CommandAction =
    | { type: 'NAVIGATE', payload: string }
    | { type: 'LOG', payload: string }
    | { type: 'SET_LOGS', payload: string[] }
    | { type: 'GENERATE_REPORT', payload: string }
    | { type: 'THEME', payload: { type: 'color' | 'bg' | 'spacing' | 'font' | 'fontsize', value: string } }
    | { type: 'NONE' };

type CommandHandler = (args: string) => Promise<void> | void;

export function useCommandProcessor(
    onLog: (log: string) => void,
    onStatus: (status: string) => void,
    setLogs: React.Dispatch<React.SetStateAction<string[]>>,
    onAction?: (action: CommandAction) => void
) {
    const router = useRouter();
    const [chatMode, setChatMode] = useState(false);

    // --- COMMAND REGISTRY ---
    const commands: Record<string, { desc: string, handler: CommandHandler }> = {
        // === CORE ===
        'help': {
            desc: 'List all commands',
            handler: () => {
                const list = Object.entries(commands)
                    .map(([key, val]) => `  /${key.padEnd(15)} - ${val.desc}`);
                setLogs(prev => [`< [SYSTEM]: AVAILABLE COMMANDS:`, ...list, ...prev]);
            }
        },
        'man': {
            desc: 'Manual page',
            handler: (cmd) => {
                if (!cmd) return onLog('< [SYSTEM]: Usage: /man [command]');
                const target = cmd.trim().replace('/', '');
                if (commands[target]) {
                    onLog(`< [MAN]: /${target}`);
                    onLog(`  Description: ${commands[target].desc}`);
                    onLog(`  Usage: /${target} [args]`);
                    // We could add extended descriptions here if we had them in the registry
                } else {
                    onLog(`< [SYSTEM]: Unknown command '${target}'`);
                }
            }
        },
        'clear': {
            desc: 'Clear terminal',
            handler: () => setLogs([])
        },
        'mode': {
            desc: 'Switch mode (command/chat)',
            handler: (args) => {
                if (args === 'chat') {
                    setChatMode(true);
                    onLog('< [SYSTEM]: Entered CHAT MODE. All inputs will be sent to AI. Type "/mode command" to exit.');
                } else if (args === 'command') {
                    setChatMode(false);
                    onLog('< [SYSTEM]: Entered COMMAND MODE.');
                } else {
                    onLog('< [SYSTEM]: Unknown mode. Try "chat" or "command".');
                }
            }
        },

        // === LOGGING ===
        'log': { desc: 'Log workout (e.g. "bench 225x5")', handler: (args) => processAICommand(args, 'workout') },
        'weight': { desc: 'Log bodyweight', handler: (args) => processAICommand(`weight ${args}`, 'weight') },
        'sleep': { desc: 'Log sleep hours', handler: (args) => processAICommand(`sleep ${args}`, 'sleep') },
        'mood': { desc: 'Log mood (1-10)', handler: (args) => processAICommand(`mood ${args}`, 'mood') },
        'energy': { desc: 'Log energy (1-10)', handler: (args) => processAICommand(`energy ${args}`, 'energy') },
        'water': { desc: 'Log water (oz)', handler: (args) => processAICommand(`water ${args}`, 'water') },
        'cardio': { desc: 'Log cardio', handler: (args) => processAICommand(`cardio ${args}`, 'cardio') },
        'food': { desc: 'Log meal', handler: (args) => processAICommand(`food ${args}`, 'food') },
        'note': { desc: 'Log note', handler: (args) => processAICommand(`note ${args}`, 'note') },

        // === DATA RETRIEVAL / GENERATION ===
        'generate': {
            desc: 'Generate report (weight, activity, pr)',
            handler: (type) => {
                if (onAction) onAction({ type: 'GENERATE_REPORT', payload: type });
                onLog(`< [SYSTEM]: Generating ${type.toUpperCase()} report...`);
            }
        },
        'view': {
            desc: 'Navigate (dashboard, analytics)',
            handler: (page) => {
                if (page === 'analytics') router.push('/dashboard/analytics');
                else if (page === 'dashboard') router.push('/dashboard');
                else onLog(`< [SYSTEM]: Unknown view '${page}'`);
            }
        },
        'stats': { desc: 'Show summary stats', handler: () => onLog('< [SYSTEM]: Stats: [PLACEHOLDER] Use /generate for graphs.') },
        'today': { desc: 'Show today logs', handler: () => onLog('< [SYSTEM]: [PLACEHOLDER] Today logs...') },
        'history': {
            desc: 'Show history',
            handler: () => {
                onLog('< [SYSTEM]: History data is visualized in the Analytics dashboard.');
                onLog('< [SYSTEM]: Type "/view analytics" to see your 365-day progression.');
                router.push('/dashboard/analytics');
            }
        },

        // === SYSTEM & THEME ===
        'color': { desc: 'Set accent color', handler: (val) => onAction?.({ type: 'THEME', payload: { type: 'color', value: val } }) },
        'bgcolor': { desc: 'Set bg color', handler: (val) => onAction?.({ type: 'THEME', payload: { type: 'bg', value: val } }) },
        'spacing': { desc: 'Set spacing', handler: (val) => onAction?.({ type: 'THEME', payload: { type: 'spacing', value: val } }) },
        'fontsize': { desc: 'Set font size', handler: (val) => onAction?.({ type: 'THEME', payload: { type: 'fontsize', value: val } }) },
        'ping': { desc: 'Pong', handler: () => onLog('< [SYSTEM]: Pong! (1ms)') },
        'version': { desc: 'Show version', handler: () => onLog('< [SYSTEM]: IronMind OS v2.0.0 (Superuser)') },
        'time': { desc: 'Show time', handler: () => onLog(`< [SYSTEM]: ${new Date().toLocaleTimeString()}`) },
        'date': { desc: 'Show date', handler: () => onLog(`< [SYSTEM]: ${new Date().toLocaleDateString()}`) },
        'whoami': { desc: 'Current user', handler: () => onLog('< [SYSTEM]: root') },

        // === AI & CHAT ===
        'chat': { desc: 'Quick AI chat', handler: (msg) => processAIQuery(msg) },
        'ask': { desc: 'Ask AI', handler: (msg) => processAIQuery(msg) },
        'analyze': { desc: 'Analyze recent data', handler: () => processAIQuery('Analyze my recent workout data and give insights.') },
        'advice': { desc: 'Get workout advice', handler: () => processAIQuery('Give me workout advice based on my stats.') },
        'roast': { desc: 'Roast my stats', handler: () => processAIQuery('Roast my workout consistency and stats.') },

        // === EXTRAS ===
        'quote': { desc: 'Motivational quote', handler: () => processAIQuery('Give me a short hardcore gym quote.') },
        'coinflip': { desc: 'Flip a coin', handler: () => onLog(`< [SYSTEM]: ${Math.random() > 0.5 ? 'HEADS' : 'TAILS'}`) },
        'roll': { desc: 'Roll dice', handler: (d) => onLog(`< [SYSTEM]: Rolled ${Math.floor(Math.random() * (parseInt(d) || 6)) + 1}`) },
        'logout': { desc: 'Sign out', handler: () => onLog('< [SYSTEM]: (Use the button for now)') },
        'todo': { desc: 'Manage todos', handler: (args) => onLog(`< [SYSTEM]: Todo '${args}' added (local session only).`) },
        'calc': { desc: 'Simple calc', handler: (args) => { try { onLog(`< [SYSTEM]: ${eval(args)}`) } catch { onLog('< [ERROR]: Invalid math') } } },
        'weather': { desc: 'Check weather', handler: () => onLog('< [SYSTEM]: 72°F Sunny (Mock Data)') },
        'music': { desc: 'Control music', handler: () => onLog('< [SYSTEM]: playing: "Phonk Playlist Vol 1"') },
        'timer': {
            desc: 'Start timer (s)', handler: (args) => {
                const s = parseInt(args);
                if (!s) return onLog('< [ERROR]: Invalid time');
                onLog(`< [SYSTEM]: Timer set for ${s}s`);
                setTimeout(() => onLog(`< [SYSTEM]: TIMER DONE (${s}s)`), s * 1000);
            }
        },
        'stopwatch': { desc: 'Start stopwatch', handler: () => onLog('< [SYSTEM]: Stopwatch started [Use /stop to end]') },
        'alarm': { desc: 'Set alarm', handler: () => onLog('< [SYSTEM]: Alarm set.') },
        'define': { desc: 'Define word', handler: (word) => processAIQuery(`Define ${word} concisely.`) },
        'translate': { desc: 'Translate text', handler: (text) => processAIQuery(`Translate this to Spanish: ${text}`) },
        'fact': { desc: 'Random fact', handler: () => processAIQuery('Tell me a random bodybuilding fact.') },
        'joke': { desc: 'Tell a joke', handler: () => processAIQuery('Tell me a gym joke.') },
        'haiku': { desc: 'Generate haiku', handler: (topic) => processAIQuery(`Write a haiku about ${topic || 'lifting'}`) },
        'whois': { desc: 'Domain lookup', handler: (d) => onLog(`< [SYSTEM]: Looking up ${d}... (Mock)`) },
        'ip': { desc: 'My IP', handler: () => onLog('< [SYSTEM]: 127.0.0.1') },
        'uptime': { desc: 'System uptime', handler: () => onLog(`< [SYSTEM]: ${process.uptime()}s`) },
        'echo': { desc: 'Echo text', handler: (t) => onLog(`< [SYSTEM]: ${t}`) },
        'reverse': { desc: 'Reverse text', handler: (t) => onLog(`< [SYSTEM]: ${t.split('').reverse().join('')}`) },
        'length': { desc: 'String length', handler: (t) => onLog(`< [SYSTEM]: ${t.length} chars`) },

        // === USER ===
        'profile': { desc: 'View profile', handler: () => onLog('< [SYSTEM]: User Profile: LEVEL 1 IRON_ACOLYTE') },
        'goals': { desc: 'View goals', handler: () => onLog('< [SYSTEM]: Goals: 1. Bench 225, 2. Squat 315') },
        'edit': { desc: 'Edit profile', handler: () => onLog('< [SYSTEM]: edit mode not implemented yet.') },
        'password': { desc: 'Change password', handler: () => onLog('< [SYSTEM]: Security Settings locked.') },

        // === NAVIGATION SHORTCUTS ===
        'home': { desc: 'Go home', handler: () => router.push('/dashboard') },
        'ana': { desc: 'Go analytics', handler: () => router.push('/dashboard/analytics') },
        'set': { desc: 'Settings', handler: () => onLog('< [SYSTEM]: Settings are handled via commands.') },

        // === SYSTEM INFO ===
        'sys': { desc: 'System monitor', handler: () => onLog('< [SYSTEM]: CPU: 12% | RAM: 4GB/16GB | NET: ONLINE') },
        'disk': { desc: 'Disk usage', handler: () => onLog('< [SYSTEM]: /dev/sda1 45% used') },
        'neofetch': { desc: 'Show system info', handler: () => onLog('< [SYSTEM]: \n   OS: IronMind OS\n   Kernel: 5.15.0\n   Shell: ZSH\n   Theme: Cyberpunk') },
        'top': { desc: 'List processes', handler: () => onLog('< [SYSTEM]: PID USER %CPU %MEM COMMAND\n  1 root 0.0 0.1 init') },

        // === NEW ===
        'new': {
            desc: 'Create new activity',
            handler: (args) => {
                if (args.startsWith('activity ')) onLog(`< [SYSTEM]: Tracked new activity: ${args.replace('activity ', '')}`);
            }
        }
    };

    // --- HELPER FUNCTIONS ---
    const processAICommand = async (text: string, type: string) => {
        onStatus('LOGGING...');
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            if (!res.ok) throw new Error('Network Error');
            const response = await res.json();
            onStatus('SAVED');

            let displayMsg = response.display || `Logged ${type}`;
            onLog(`< [SYSTEM]: ${displayMsg}`);

            // detailed parsing feedback
            if (response.type === 'food' && response.data) {
                const { calories, protein, carbs, fat } = response.data;
                onLog(`< [PARSED]: ${calories}kcal | P:${protein}g | C:${carbs}g | F:${fat}g`);
            }
            if (response.type === 'cardio' && response.data) {
                const { duration, distance, calories } = response.data;
                onLog(`< [PARSED]: ${duration}min | ${distance}mi | ${calories}kcal`);
            }
            if (response.type === 'workout' && response.data && Array.isArray(response.data)) {
                response.data.forEach((ex: any) => {
                    onLog(`< [PARSED]: ${ex.exercise} | ${ex.weight}x${ex.reps} x ${ex.sets}`);
                });
            }

        } catch (err) {
            onStatus('ERROR');
            onLog(`< [ERROR]: ${String(err)}`);
        }
    };

    const processAIQuery = async (text: string) => {
        onStatus('THINKING...');
        try {
            // Re-using same endpoint but assuming it handles generic chat or we append a flag?
            // For now, simpliest is to just send text. The backend parser might try to "log" it, 
            // but if we phrase it as a question, hopefully it just returns text.
            // Ideally we'd have a separate field or endpoint for "chat".
            // Let's assume the backend returns a "message" field for chat.
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, mode: 'chat' }) // We might need to update API to handle 'mode'
            });
            const response = await res.json();
            onStatus('IDLE');
            // Fallback to whatever the API returns
            const reply = response.message || response.display || "ACK.";
            onLog(`< [AI]: ${reply}`);
        } catch (err) {
            onStatus('ERROR');
            onLog(`< [ERROR]: ${String(err)}`);
        }
    };

    const processCommand = async (cmd: string) => {
        const trimmed = cmd.trim();
        if (!trimmed) return;

        // CHAT MODE INTERCEPT
        if (chatMode) {
            if (trimmed.toLowerCase() === '/mode command') {
                setChatMode(false);
                onLog('< [SYSTEM]: Exited CHAT MODE.');
                return;
            }
            // Treat everything as chat
            await processAIQuery(trimmed);
            return;
        }

        // STANDARD COMMAND PROCESSING
        const [commandRaw, ...argsArr] = trimmed.split(' ');
        const command = commandRaw.toLowerCase().replace('/', '');
        const args = argsArr.join(' ');

        if (commands[command]) {
            await commands[command].handler(args);
        } else {
            // Fallback: try finding partial match or just log error
            onLog(`< [SYSTEM]: Unknown command '/${command}'. Type /help.`);
        }
    };

    return { processCommand, chatMode };
}
