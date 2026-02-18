
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AnalyticsClient from './AnalyticsClient';

export default async function AnalyticsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const userId = session.user.id;

    // Fetch all workouts
    const workouts = await prisma.workout.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true, parsed: true }
    });

    // Process data for charts
    const prData = {
        bench: [] as any[],
        squat: [] as any[],
        deadlift: [] as any[]
    };

    const volumeDataMap = new Map();

    // 365 Days Activity Grid Mockup (Real implementation would be more complex)
    const activityData = Array.from({ length: 30 }).map((_, i) => ({
        date: `Day ${i + 1}`,
        count: 0
    }));

    workouts.forEach(workout => {
        try {
            const data = JSON.parse(workout.parsed);
            const date = workout.createdAt.toISOString().split('T')[0];

            // Simple activity counter
            const dayIndex = new Date(workout.createdAt).getDate() % 30; // Mock mapping
            if (activityData[dayIndex]) activityData[dayIndex].count++;

            if (Array.isArray(data)) {
                data.forEach((exercise: any) => {
                    const name = exercise.exercise.toLowerCase();
                    const weight = exercise.weight || 0;
                    const reps = exercise.reps || 0;

                    // PR Tracking
                    if (name.includes('bench')) {
                        prData.bench.push({ date, weight, unit: 'lbs' });
                    } else if (name.includes('squat')) {
                        prData.squat.push({ date, weight, unit: 'lbs' });
                    } else if (name.includes('deadlift')) {
                        prData.deadlift.push({ date, weight, unit: 'lbs' });
                    }

                    // Volume (Pullups/Dips)
                    if (name.includes('pullup') || name.includes('dip')) {
                        if (!volumeDataMap.has(date)) {
                            volumeDataMap.set(date, { date, pullups: 0, dips: 0 });
                        }
                        const entry = volumeDataMap.get(date);
                        if (name.includes('pullup')) entry.pullups += reps;
                        if (name.includes('dip')) entry.dips += reps;
                    }
                });
            }
        } catch (e) {
            console.error("Failed to parse workout for analytics", e);
        }
    });

    const volumeData = Array.from(volumeDataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <AnalyticsClient
            prData={prData}
            volumeData={volumeData}
            activityData={activityData}
        />
    );
}
