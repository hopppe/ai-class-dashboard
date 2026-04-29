import OpenAI from "openai";
import { z } from "zod";

const apiKey = process.env.OPEN_AI_API_KEY;

const requestSchema = z.object({
  text: z.string().min(1, "text is required"),
});

export async function POST(request: Request) {
  if (!apiKey) {
    return Response.json(
      { success: false, error: "OPEN_AI_API_KEY is not configured" },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.message },
      { status: 400 },
    );
  }

  try {
    const client = new OpenAI({ apiKey });
    const audio = await client.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: parsed.data.text,
    });

    const buffer = await audio.arrayBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Speech synthesis failed";
    return Response.json({ success: false, error: message }, { status: 502 });
  }
}
