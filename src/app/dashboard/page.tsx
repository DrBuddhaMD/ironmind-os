import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient'; // Co-located

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    // Fetch initial data
    const workouts = await prisma.workout.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    const biometrics = await prisma.biometric.findMany({
        where: { userId: session.user.id, type: 'weight' }, // Focus on weight for chart
        orderBy: { createdAt: 'asc' },
        take: 30
    });

    const recentHabits = await prisma.habit.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono selection:bg-green-900 selection:text-white overflow-hidden">
            <DashboardClient
                user={session.user}
                initialWorkouts={workouts}
                initialBiometrics={biometrics}
                initialHabits={recentHabits}
            />
        </div>
    );
}
