import OpenAI from "openai";

const apiKey = process.env.OPEN_AI_API_KEY;

export async function POST(request: Request) {
  if (!apiKey) {
    return Response.json(
      { success: false, error: "OPEN_AI_API_KEY is not configured" },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { success: false, error: "Invalid form data" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json(
      { success: false, error: "Missing audio file" },
      { status: 400 },
    );
  }

  try {
    const client = new OpenAI({ apiKey });
    const transcription = await client.audio.transcriptions.create({
      file,
      model: "gpt-4o-mini-transcribe",
    });
    return Response.json({ success: true, text: transcription.text });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Transcription failed";
    return Response.json({ success: false, error: message }, { status: 502 });
  }
}
