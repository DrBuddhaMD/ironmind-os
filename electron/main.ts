import { app, Tray, Menu, nativeImage, shell, dialog } from 'electron';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import os from 'os';

let tray: Tray | null = null;
let serverProcess: ChildProcess | null = null;
let isDev = process.env.NODE_ENV !== 'production';
const PORT = 3000;

function createWindow() {
    // We don't create a window by default, just the tray.
    if (process.platform === 'darwin') {
        app.dock?.hide();
    }
}

function startServer() {
    if (serverProcess) return;

    const cwd = process.cwd();
    const cmd = 'npm';
    const args = isDev ? ['run', 'dev', '--', '-H', '0.0.0.0'] : ['run', 'start', '--', '-H', '0.0.0.0'];

    console.log(`Starting Next.js server: ${cmd} ${args.join(' ')}`);

    serverProcess = spawn(cmd, args, {
        cwd,
        stdio: 'inherit', // Pipe output to main console
        env: { ...process.env, PORT: String(PORT) }
    });

    serverProcess.on('error', (err) => {
        console.error('Failed to start server:', err);
        dialog.showErrorBox('Server Error', 'Failed to start IronMind server.');
    });
}

function stopServer() {
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
        console.log('Server process killed.');
    }
}

async function setupCliAlias() {
    // Auto-alias logic for 'ironmind'
    const shellConfig = path.join(os.homedir(), '.zshrc'); // Assuming zsh for macOS
    const aliasCommand = `alias ironmind="cd '${process.cwd()}' && npm run tui"`;

    if (fs.existsSync(shellConfig)) {
        const content = fs.readFileSync(shellConfig, 'utf-8');
        if (!content.includes('alias ironmind=')) {
            fs.appendFileSync(shellConfig, `\n# IronMind OS CLI\n${aliasCommand}\n`);
            console.log('Added ironmind alias to .zshrc');
            // Ideally we'd source it, but user might need to restart shell.
        }
    }
}

app.whenReady().then(() => {
    // 1. Setup Tray
    // Use a simple text title if no icon yet, or a system icon.
    // For now, we'll try to generate a simple icon or just use title.
    // macOS Tray supports setting title directly.
    tray = new Tray(nativeImage.createEmpty()); // Empty icon to start, or load one
    tray.setTitle('❤ IronMind'); // Heart icon in text

    // 2. Build Menu
    const updateMenu = (status: 'running' | 'stopped') => {
        const contextMenu = Menu.buildFromTemplate([
            { label: `Status: ${status === 'running' ? 'Running' : 'Stopped'}`, enabled: false },
            { type: 'separator' },
            {
                label: status === 'running' ? 'Stop Server' : 'Start Server',
                click: () => {
                    if (status === 'running') {
                        stopServer();
                        tray?.setTitle('🤍 IronMind');
                        updateMenu('stopped');
                    } else {
                        startServer();
                        tray?.setTitle('❤ IronMind');
                        updateMenu('running');
                    }
                }
            },
            { type: 'separator' },
            { label: 'Open Web Interface', click: () => shell.openExternal(`http://localhost:${PORT}`) },
            {
                label: 'Open Prisma Studio', click: () => {
                    spawn('npx', ['prisma', 'studio'], { stdio: 'ignore', detached: true }).unref();
                }
            },
            { type: 'separator' },
            { label: 'Install CLI Tools', click: () => setupCliAlias() },
            { type: 'separator' },
            {
                label: 'Quit IronMind', click: () => {
                    stopServer();
                    app.quit();
                }
            }
        ]);
        tray?.setContextMenu(contextMenu);
    };

    // Initial State
    startServer();
    updateMenu('running');

    // Auto-setup CLI on first run? Maybe optional.
    // setupCliAlias(); 
});

// Quit when all windows are closed? No, keep running in tray.
app.on('window-all-closed', () => {
    // Do nothing
});

app.on('before-quit', () => {
    stopServer();
});
