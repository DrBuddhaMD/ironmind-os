import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { prisma } from '../lib/prisma';
// import crypto from 'crypto'; // For real auth we'd hash, but for MVP local tool we might just check existence or plain (unsafe but simple for now)
// Actually we should use bcrypt if we can, but TUI environment might be tricky.
// Let's assume for this "OS" simulator, we just check username matching for now? 
// Or better, simple check against DB.

const TuiApp = () => {
    const { exit } = useApp();
    const [view, setView] = useState<'LOGIN' | 'DASHBOARD'>('LOGIN');

    // Auth State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); // Visual only, we verify username for MVP redundancy
    const [authField, setAuthField] = useState<'USERNAME' | 'PASSWORD'>('USERNAME');
    const [authError, setAuthError] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Dashboard State
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('READY');
    const [logs, setLogs] = useState<string[]>([]);

    // Data State
    const [weight, setWeight] = useState<number | null>(null);
    const [streak, setStreak] = useState(12); // Mock for now

    const handleLogin = async () => {
        if (!username) {
            setAuthError('Username required');
            return;
        }

        try {
            // MVP: Direct DB check for User existence. Passwords in TUI vs NextAuth is complex without sharing hashed secrets.
            // For this localized task, we trust the username if it exists.
            const user = await prisma.user.findUnique({ where: { username } });
            if (user) {
                setCurrentUser(user);
                setView('DASHBOARD');
                setLogs([`< [SYSTEM]: Welcome back, ${currentUser?.username}.`]);

                // Fetch initial data
                const bio = await prisma.biometric.findFirst({
                    where: { userId: user.id, type: 'weight' },
                    orderBy: { createdAt: 'desc' }
                });
                if (bio) setWeight(bio.value);

            } else {
                setAuthError('User not found.');
            }
        } catch (e) {
            setAuthError('DB Error: ' + String(e));
        }
    };

    useInput((input, key) => {
        if (view === 'LOGIN') {
            if (key.return) {
                if (authField === 'USERNAME') {
                    setAuthField('PASSWORD');
                } else {
                    handleLogin();
                }
            }
            if (key.escape) {
                exit();
            }
        }
    });

    const handleCommand = async (value: string) => {
        if (value.trim() === 'exit') {
            exit();
            return;
        }
        if (value.trim() === '/clear') {
            setLogs([]);
            setInput('');
            return;
        }
        if (value.trim() === '/help') {
            setLogs(prev => [
                `< [SYSTEM]: COMMANDS: /log [text], /weight [lbs], /clear, exit`,
                ...prev
            ]);
            setInput('');
            return;
        }

        setStatus('PROCESSING...');
        setLogs(prev => [`> ${value}`, ...prev]);
        setInput('');

        try {
            // Call API
            const res = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: value.replace('/log ', '') })
            });
            const data = await res.json();

            setStatus('LOGGED');
            setLogs(prev => [`< [SYSTEM]: ${data.display || data.type}`, ...prev]);

            if (data.type === 'biometric' && data.data.type === 'weight') {
                setWeight(data.data.value);
            }

        } catch (e) {
            setStatus('ERROR');
            setLogs(prev => [`< [ERROR]: Connection failed. Is server running?`, ...prev]);
        }

        setTimeout(() => setStatus('READY'), 2000);
    };

    if (view === 'LOGIN') {
        return (
            <Box flexDirection="column" padding={1} borderStyle="round" borderColor="green" width={60}>
                <Text color="green" bold>IRONMIND_OS v1.0 // ACCESS_CONTROL</Text>
                <Box flexDirection="column" marginTop={1}>
                    <Box>
                        <Text color="green">USERNAME: </Text>
                        {authField === 'USERNAME' ? (
                            <TextInput value={username} onChange={setUsername} />
                        ) : (
                            <Text>{username}</Text>
                        )}
                    </Box>
                    <Box>
                        <Text color="green">PASSWORD: </Text>
                        {authField === 'PASSWORD' ? (
                            <TextInput value={password} onChange={setPassword} mask="*" />
                        ) : (
                            <Text>{'*'.repeat(password.length)}</Text>
                        )}
                    </Box>
                    {authError && <Text color="red" bold>{`>> ${authError}`}</Text>}
                </Box>
                <Box marginTop={1}>
                    <Text color="gray">[ENTER] Accept  [ESC] Exit</Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box flexDirection="row" padding={1} borderStyle="double" borderColor="green" height={20} width={80}>
            {/* LEFT: Dashboard Stats */}
            <Box flexDirection="column" width="30%" borderStyle="single" borderColor="green" marginRight={1} padding={1}>
                <Text bold underline color="white">STATUS_MONITOR</Text>
                <Box marginTop={1} flexDirection="column">
                    <Text color="green">USER: {currentUser?.username}</Text>
                    <Text color="green">STREAK: {streak} DAYS</Text>
                    <Text color="green">WEIGHT: {weight ? `${weight} lbs` : 'N/A'}</Text>
                </Box>
                <Box marginTop={2}>
                    <Text color="yellow">PR_FEED:</Text>
                    <Text>BENCH: 225</Text>
                    <Text>SQUAT: 315</Text>
                </Box>
            </Box>

            {/* RIGHT: Terminal */}
            <Box flexDirection="column" width="70%">
                <Box flexGrow={1} flexDirection="column-reverse">
                    {logs.map((l, i) => (
                        <Text key={i}>{l}</Text>
                    ))}
                    {logs.length === 0 && <Text color="gray">System ready...</Text>}
                </Box>

                <Box borderStyle="single" borderColor="green" marginTop={1}>
                    <Text color="green">{'>'} </Text>
                    <TextInput
                        value={input}
                        onChange={setInput}
                        onSubmit={handleCommand}
                        placeholder="..."
                    />
                    <Text color="gray"> {status}</Text>
                </Box>
            </Box>
        </Box>
    );
};

export default TuiApp;
