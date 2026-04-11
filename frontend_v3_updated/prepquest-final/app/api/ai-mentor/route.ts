import { NextRequest, NextResponse } from "next/server"

const GROQ_API_KEY = process.env.GROQ_API_KEY || ""

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json()

        if (!GROQ_API_KEY) {
            return NextResponse.json({ error: "GROQ_API_KEY is not set" }, { status: 500 })
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are an expert AI Mentor helping students prepare for technical placements and FAANG interviews. You are concise, encouraging, and practical. After each response, suggest 2-3 short follow-up actions the user might want to take, formatted as a JSON suffix like: SUGGESTIONS:[\"action1\",\"action2\"]",
                    },
                    ...messages,
                ],
                max_tokens: 1024,
                temperature: 0.7,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error("Groq API error:", data)
            return NextResponse.json({ error: data }, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (err) {
        console.error("Route error:", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}