'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions';
import { Terminal, Shield } from 'lucide-react';

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md border border-green-800 bg-black/50 p-8 rounded-none shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <div className="flex items-center gap-3 mb-8 border-b border-green-800 pb-4">
                    <Terminal className="w-6 h-6 animate-pulse" />
                    <h1 className="text-xl font-bold tracking-wider">IRONMIND_OS v1.0.0</h1>
                </div>

                <form action={dispatch} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest mb-2 opacity-70"> User Identification</label>
                        <input
                            name="email"
                            type="text"
                            placeholder="username"
                            className="w-full bg-black border border-green-800 p-3 outline-none focus:border-green-500 transition-colors placeholder:text-green-900"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest mb-2 opacity-70"> Access Code</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="password"
                            className="w-full bg-black border border-green-800 p-3 outline-none focus:border-green-500 transition-colors placeholder:text-green-900"
                            required
                        />
                    </div>

                    <LoginButton />

                    {errorMessage && (
                        <div className="mt-4 p-3 border border-red-800 bg-red-900/10 text-red-500 text-sm">
                            ERROR: {errorMessage}
                        </div>
                    )}
                </form>

                <div className="mt-8 text-center text-xs opacity-50">
                    <a href="/signup" className="hover:text-green-400 hover:underline">[ REGISTER NEW USER ]</a>
                </div>
            </div>
        </div>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-green-900/20 border border-green-500 text-green-500 py-3 font-bold hover:bg-green-500 hover:text-black transition-all flex items-center justify-center gap-2 group"
        >
            {pending ? 'AUTHENTICATING...' : (
                <>
                    <Shield className="w-4 h-4" />
                    <span>INITIATE_SESSION</span>
                </>
            )}
        </button>
    );
}
