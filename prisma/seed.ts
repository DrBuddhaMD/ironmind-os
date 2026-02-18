import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminUsername = 'admin';
    const adminPassword = 'password123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const user = await prisma.user.upsert({
        where: { username: adminUsername },
        update: {},
        create: {
            username: adminUsername,
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log({ user });

    // Generate 365 Days of History
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 365);

    console.log("Seeding 365 days of data...");

    const weightTrend = [];
    const workouts = [];

    let currentWeight = 185;

    for (let i = 0; i <= 365; i++) {
        const date = new Date(oneYearAgo);
        date.setDate(date.getDate() + i);

        // 1. Weight Log (Daily, with noise)
        // Trend: drops to 170 then bulk to 190
        if (i < 180) currentWeight -= 0.05; // Cut
        else currentWeight += 0.08; // Bulk

        const weight = currentWeight + (Math.random() * 2 - 1); // +/- 1lb noise

        await prisma.biometric.create({
            data: {
                userId: user.id,
                type: 'weight',
                value: parseFloat(weight.toFixed(1)),
                createdAt: date
            }
        });

        // 2. Workout Log (3-4 times a week)
        if (Math.random() > 0.4) {
            const isPush = i % 3 === 0;
            const isPull = i % 3 === 1;
            const isLegs = i % 3 === 2;

            let content = "";
            let parsedData = [];

            if (isPush) {
                content = "Bench Press 5x5, Overhead Press 3x8, Incline Dumbbell 3x10";
                parsedData = [
                    { exercise: "Bench Press", sets: 5, reps: 5, weight: 135 + Math.floor(i / 10) * 5, unit: 'lbs' },
                    { exercise: "Overhead Press", sets: 3, reps: 8, weight: 95 + Math.floor(i / 15) * 2.5, unit: 'lbs' }
                ];
            } else if (isPull) {
                content = "Deadlift 3x5, Pullups 3x10, Rows 3x12";
                parsedData = [
                    { exercise: "Deadlift", sets: 3, reps: 5, weight: 225 + Math.floor(i / 10) * 5, unit: 'lbs' }
                ];
            } else {
                content = "Squat 5x5, Leg Press 3x12, Calf Raises 4x15";
                parsedData = [
                    { exercise: "Squat", sets: 5, reps: 5, weight: 185 + Math.floor(i / 10) * 5, unit: 'lbs' }
                ];
            }

            await prisma.workout.create({
                data: {
                    userId: user.id,
                    content: content,
                    parsed: JSON.stringify({ type: 'workout', data: parsedData }),
                    createdAt: date
                }
            });
        }
    }
    console.log("Seeding complete.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
