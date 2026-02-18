import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { text } = await req.json();

    try {
        // Call LM Studio (Local Inference)
        const aiResponse = await fetch('http://localhost:1234/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "local-model", // LM Studio handles routing automatically usually
                messages: [
                    {
                        role: "system",
                        content: `You are a strict JSON parser for a health OS. Analyze the user's input and return JSON ONLY. No markdown, no preambles.
            
            Supported types:
            1. 'workout': strength training logs. Data: array of { exercise: string, sets: number, reps: number, weight: number | null, unit: 'lbs' | 'kg' }.
            2. 'biometric': health metrics. Data: { type: 'weight' | 'bodyfat', value: number, unit: 'lbs' | '%' }.
            3. 'habit': daily habits. Data: { name: string, status: 'completed' }.
            4. 'food': nutrition logs. Data: { item: string, calories: number (estimate if not provided), protein: number (g), carbs: number (g), fat: number (g) }.
            5. 'cardio': cardio logs. Data: { type: string, duration: number (min), distance: number | null (miles), calories: number (estimate) }.
            
            Return format: { 
                "type": "workout" | "biometric" | "habit" | "food" | "cardio", 
                "data": any, 
                "display": "Brief confirmation text identifying what was tracked." 
            }`
                    },
                    { role: "user", content: text }
                ],
                temperature: 0.1
            })
        });

        if (!aiResponse.ok) {
            throw new Error('LM Studio response not ok');
        }

        const aiData = await aiResponse.json();
        let content = aiData.choices[0].message.content;

        // Cleanup markdown code blocks if present
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsed = JSON.parse(content);

        // Persist to DB based on intent
        if (parsed.type === 'biometric') {
            await prisma.biometric.create({
                data: {
                    userId: session.user.id,
                    type: parsed.data.type,
                    value: parsed.data.value
                }
            });
        } else if (parsed.type === 'workout') {
            await prisma.workout.create({
                data: {
                    userId: session.user.id,
                    content: text,
                    parsed: JSON.stringify(parsed.data)
                }
            });
        } else if (parsed.type === 'habit') {
            // Logic to find or create habit
            await prisma.habit.create({
                data: {
                    userId: session.user.id,
                    name: parsed.data.name,
                    completed: parsed.data.status === 'completed'
                }
            });
        } else if (parsed.type === 'food' || parsed.type === 'cardio') {
            // For now, store these as generic "notes" or extend the schema later if needed.
            // But realistically, user wants detailed history.
            // Let's store in 'workout' table with a special tag or just plain log for now to satisfy the "save" requirement
            // effectively, we can create a 'Log' entry if we had a generic log table.
            // existing schema has 'Workout', 'Biometric', 'Habit'.
            // Use 'Workout' with parsed JSON as a catch-all for now since it has a 'parsed' JSON field.
            await prisma.workout.create({
                data: {
                    userId: session.user.id,
                    content: text,
                    parsed: JSON.stringify(parsed) // Store the whole parsed object including type
                }
            });
        }

        return NextResponse.json({
            ...parsed,
            debug: {
                rawRaw: aiData.choices[0].message.content, // The absolute raw string from AI
                cleaned: content, // The string we tried to parse
            }
        });
    } catch (e) {
        console.error(e);
        // Fallback: If AI fails, we might just log it as a raw note or return error
        return NextResponse.json({ error: "System Offline or Parse Failed", details: String(e) }, { status: 500 });
    }
}
