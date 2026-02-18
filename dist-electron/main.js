"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path_1 = __importDefault(require("path"));
var child_process_1 = require("child_process");
var fs_1 = __importDefault(require("fs"));
var os_1 = __importDefault(require("os"));
var tray = null;
var serverProcess = null;
var isDev = process.env.NODE_ENV !== 'production';
var PORT = 3000;
function createWindow() {
    var _a;
    // We don't create a window by default, just the tray.
    if (process.platform === 'darwin') {
        (_a = electron_1.app.dock) === null || _a === void 0 ? void 0 : _a.hide();
    }
}
function startServer() {
    if (serverProcess)
        return;
    var cwd = process.cwd();
    var cmd = 'npm';
    var args = isDev ? ['run', 'dev', '--', '-H', '0.0.0.0'] : ['run', 'start', '--', '-H', '0.0.0.0'];
    console.log("Starting Next.js server: ".concat(cmd, " ").concat(args.join(' ')));
    serverProcess = (0, child_process_1.spawn)(cmd, args, {
        cwd: cwd,
        stdio: 'inherit', // Pipe output to main console
        env: __assign(__assign({}, process.env), { PORT: String(PORT) })
    });
    serverProcess.on('error', function (err) {
        console.error('Failed to start server:', err);
        electron_1.dialog.showErrorBox('Server Error', 'Failed to start IronMind server.');
    });
}
function stopServer() {
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
        console.log('Server process killed.');
    }
}
function setupCliAlias() {
    return __awaiter(this, void 0, void 0, function () {
        var shellConfig, aliasCommand, content;
        return __generator(this, function (_a) {
            shellConfig = path_1.default.join(os_1.default.homedir(), '.zshrc');
            aliasCommand = "alias ironmind=\"cd '".concat(process.cwd(), "' && npm run tui\"");
            if (fs_1.default.existsSync(shellConfig)) {
                content = fs_1.default.readFileSync(shellConfig, 'utf-8');
                if (!content.includes('alias ironmind=')) {
                    fs_1.default.appendFileSync(shellConfig, "\n# IronMind OS CLI\n".concat(aliasCommand, "\n"));
                    console.log('Added ironmind alias to .zshrc');
                    // Ideally we'd source it, but user might need to restart shell.
                }
            }
            return [2 /*return*/];
        });
    });
}
electron_1.app.whenReady().then(function () {
    // 1. Setup Tray
    // Use a simple text title if no icon yet, or a system icon.
    // For now, we'll try to generate a simple icon or just use title.
    // macOS Tray supports setting title directly.
    tray = new electron_1.Tray(electron_1.nativeImage.createEmpty()); // Empty icon to start, or load one
    tray.setTitle('❤ IronMind'); // Heart icon in text
    // 2. Build Menu
    var updateMenu = function (status) {
        var contextMenu = electron_1.Menu.buildFromTemplate([
            { label: "Status: ".concat(status === 'running' ? 'Running' : 'Stopped'), enabled: false },
            { type: 'separator' },
            {
                label: status === 'running' ? 'Stop Server' : 'Start Server',
                click: function () {
                    if (status === 'running') {
                        stopServer();
                        tray === null || tray === void 0 ? void 0 : tray.setTitle('🤍 IronMind');
                        updateMenu('stopped');
                    }
                    else {
                        startServer();
                        tray === null || tray === void 0 ? void 0 : tray.setTitle('❤ IronMind');
                        updateMenu('running');
                    }
                }
            },
            { type: 'separator' },
            { label: 'Open Web Interface', click: function () { return electron_1.shell.openExternal("http://localhost:".concat(PORT)); } },
            {
                label: 'Open Prisma Studio', click: function () {
                    (0, child_process_1.spawn)('npx', ['prisma', 'studio'], { stdio: 'ignore', detached: true }).unref();
                }
            },
            { type: 'separator' },
            { label: 'Install CLI Tools', click: function () { return setupCliAlias(); } },
            { type: 'separator' },
            {
                label: 'Quit IronMind', click: function () {
                    stopServer();
                    electron_1.app.quit();
                }
            }
        ]);
        tray === null || tray === void 0 ? void 0 : tray.setContextMenu(contextMenu);
    };
    // Initial State
    startServer();
    updateMenu('running');
    // Auto-setup CLI on first run? Maybe optional.
    // setupCliAlias(); 
});
// Quit when all windows are closed? No, keep running in tray.
electron_1.app.on('window-all-closed', function () {
    // Do nothing
});
electron_1.app.on('before-quit', function () {
    stopServer();
});
