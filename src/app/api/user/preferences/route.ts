import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const preferences = await req.json();

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                preferences: JSON.stringify(preferences)
            }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
    }
}
