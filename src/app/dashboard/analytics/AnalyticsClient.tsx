'use client';

import React from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { Trophy, Calendar, Activity } from 'lucide-react';
import Link from 'next/link';

import { useCommandProcessor } from '@/hooks/useCommandProcessor';
import { useState } from 'react';

// Helper to format checks
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black border border-green-500 p-2 text-xs font-mono">
                <p className="text-green-400 font-bold">{label}</p>
                <p className="text-white">{payload[0].value} {payload[0].unit}</p>
            </div>
        );
    }
    return null;
};

export default function AnalyticsClient({ prData, volumeData, activityData }: any) {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('READY');
    const [logs, setLogs] = useState<string[]>([]);

    // Command Processor
    const { processCommand } = useCommandProcessor(
        (log) => setLogs(prev => [log, ...prev]),
        (s) => {
            setStatus(s);
            if (s !== 'READY' && s !== 'PROCESSING...') setTimeout(() => setStatus('READY'), 2000);
        },
        setLogs
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const cmd = input;
        setInput('');
        setLogs(prev => [`> ${cmd}`, ...prev]);
        await processCommand(cmd);
    };

    return (
        <div className="min-h-screen flex flex-col p-2 md:p-4 max-w-7xl mx-auto font-mono text-green-500 bg-black selection:bg-green-900 selection:text-white">

            {/* Header */}
            <header className="flex justify-between items-center border-b border-green-900 pb-2 mb-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Activity className="w-6 h-6 text-green-500" />
                    <h1 className="text-xl font-bold tracking-tighter flex items-center gap-3">
                        ANALYTICS<span className="text-green-800">_MODULE</span>
                    </h1>
                </div>
                <div className="text-xs text-green-800 flex flex-col items-end">
                    <div>[COMMAND_MODE]</div>
                    <div>Use '/view dashboard' to return</div>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 gap-2 overflow-y-auto">
                {/* LOGS (Mini) */}
                {logs.length > 0 && (
                    <div className="bg-black border border-green-900 p-2 text-xs max-h-32 overflow-y-auto flex flex-col-reverse gap-1 mb-4">
                        {logs.map((L, i) => (
                            <div key={i} className="break-words border-l border-green-900/50 pl-2">{L}</div>
                        ))}
                    </div>
                )}

                {/* PR PROGRESSION */}
                <section>
                    <h2 className="text-xs font-bold mb-2 flex items-center gap-2 text-green-700 bg-green-900/10 p-1">
                        <Trophy className="w-3 h-3 text-yellow-600" />
                        MAX_LIFT_PROGRESSION
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {/* BENCH */}
                        <div className="bg-black border border-green-900 p-2 h-40 relative">
                            <div className="absolute top-0 right-0 bg-green-900 text-black text-[8px] px-1 font-bold">BENCH_PRESS</div>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={prData.bench}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#14532d" opacity={0.2} />
                                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#15803d' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 8, fill: '#15803d' }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'auto']} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22c55e', strokeWidth: 1 }} />
                                    <Line type="stepAfter" dataKey="weight" stroke="#22c55e" strokeWidth={2} dot={{ r: 2, fill: '#000', stroke: '#22c55e' }} activeDot={{ r: 4, fill: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* SQUAT */}
                        <div className="bg-black border border-green-900 p-2 h-40 relative">
                            <div className="absolute top-0 right-0 bg-green-900 text-black text-[8px] px-1 font-bold">SQUAT</div>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={prData.squat}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#14532d" opacity={0.2} />
                                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#15803d' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 8, fill: '#15803d' }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'auto']} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#a855f7', strokeWidth: 1 }} />
                                    <Line type="stepAfter" dataKey="weight" stroke="#a855f7" strokeWidth={2} dot={{ r: 2, fill: '#000', stroke: '#a855f7' }} activeDot={{ r: 4, fill: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* DEADLIFT */}
                        <div className="bg-black border border-green-900 p-2 h-40 relative">
                            <div className="absolute top-0 right-0 bg-green-900 text-black text-[8px] px-1 font-bold">DEADLIFT</div>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={prData.deadlift}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#14532d" opacity={0.2} />
                                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#15803d' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 8, fill: '#15803d' }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'auto']} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ef4444', strokeWidth: 1 }} />
                                    <Line type="stepAfter" dataKey="weight" stroke="#ef4444" strokeWidth={2} dot={{ r: 2, fill: '#000', stroke: '#ef4444' }} activeDot={{ r: 4, fill: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* VOLUME (Rep Counts) */}
                    <section>
                        <h2 className="text-xs font-bold mb-2 flex items-center gap-2 text-green-700 bg-green-900/10 p-1">
                            <Activity className="w-3 h-3 text-blue-500" />
                            VOLUME_TRACKER
                        </h2>
                        <div className="bg-black border border-green-900 p-2 h-40 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={volumeData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#14532d" opacity={0.2} />
                                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#15803d' }} axisLine={false} />
                                    <YAxis tick={{ fontSize: 8, fill: '#15803d' }} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(20, 83, 45, 0.2)' }} contentStyle={{ backgroundColor: '#000', borderColor: '#22c55e', color: '#22c55e', fontSize: '12px' }} />
                                    <Legend wrapperStyle={{ fontSize: '8px', paddingTop: '5px' }} />
                                    <Bar dataKey="pullups" fill="#3b82f6" name="PULLUPS" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="dips" fill="#f59e0b" name="DIPS" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* ACTIVITY STREAK */}
                    <section>
                        <h2 className="text-xs font-bold mb-2 flex items-center gap-2 text-green-700 bg-green-900/10 p-1">
                            <Calendar className="w-3 h-3 text-green-500" />
                            ACTIVITY_MAP
                        </h2>
                        <div className="bg-black border border-green-900 p-2 h-40 flex flex-col">
                            <div className="flex-1 flex content-start flex-wrap gap-1">
                                {activityData.map((day: any, i: number) => (
                                    <div
                                        key={i}
                                        title={`${day.date}: ${day.count} activities`}
                                        className={`w-3 h-3 rounded-sm transition-all border border-black ${day.count === 0 ? 'bg-green-900/10' :
                                                day.count < 3 ? 'bg-green-900' :
                                                    day.count < 5 ? 'bg-green-600' : 'bg-green-400'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* COMMAND BAR */}
            <div className="mt-4 relative shrink-0">
                <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-black border border-green-900 p-2 group focus-within:border-green-500 transition-colors">
                    <span className="text-green-500 font-bold animate-pulse">{'>'}</span>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none font-mono text-white placeholder-green-900/50"
                        placeholder="Type '/' for commands..."
                        autoFocus
                    />
                    <div className="text-[10px] font-mono text-green-800 uppercase tracking-widest">{status}</div>
                </form>
            </div>
        </div>
    );
}
