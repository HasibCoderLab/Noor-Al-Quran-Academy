import { NextResponse } from "next/server";

import { SITE, COURSES, PRICING, FAQS, TESTIMONIALS, STATS } from "../../../data/siteData";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MAX_HISTORY = 12;

const buildSystemPrompt = () => {
  const bd = PRICING.bd;
  const intl = PRICING.intl;

  const pricingText = [
    `Bangladesh (${bd.currency}):`,
    ...bd.plans.map((p) => `- ${p.name}: ${p.symbol}${p.price}/month for ${p.classes} classes`),
    `International (${intl.currency}):`,
    ...intl.plans.map((p) => `- ${p.name}: $${p.price}/month for ${p.classes} classes`),
    "Payment: bKash (Bangladesh), Stripe (international: card / Apple Pay / Google Pay).",
  ].join("\n");

  return `You are Noor AI, the friendly and helpful virtual assistant of "${SITE.name}".
You answer questions ONLY about this academy. Be warm, concise and accurate.
Use short bullet lists where helpful. Greet with the Islamic greeting when the student says salam or hello.

ACADEMY FACTS (do not invent anything outside these facts):
- Academy: ${SITE.name}
- Teacher: ${SITE.teacher}, ${SITE.teacherTitle} (since ${SITE.hafizYear}), based in ${SITE.location}
- Tagline: ${SITE.tagline}
- We serve students in: ${SITE.targetCountries.join(", ")}
- Class times (${SITE.timezone}): Sat–Thu at ${SITE.classTimes.satThu.join(", ")}; Friday at ${SITE.classTimes.friday.join(", ")}
- Class durations: ${SITE.classTimes.durations.map((d) => `${d} min`).join(" / ")}
- Free trial: YES, every new student gets a free trial class.

COURSES:
${COURSES.map((c) => `- ${c.name} (${c.arabic}): ${c.level}. ${c.description} Duration: ${c.duration} min`).join("\n")}

PRICING:
${pricingText}

STATS:
${STATS.map((s) => `- ${s.value} ${s.label}`).join("\n")}

TESTIMONIALS:
${TESTIMONIALS.map((t) => `- ${t.name} (${t.country}): "${t.text}"`).join("\n")}

FAQ:
${FAQS.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

CONTACT:
- WhatsApp: ${SITE.whatsapp}
- Email: ${SITE.email}
- Facebook: ${SITE.facebook}
- For bookings, direct students to the "Book Free Trial" page on the website or WhatsApp.

If asked something unrelated to the academy, politely steer the conversation back to Quran learning at ${SITE.name}.`;
};

const sanitizeMessages = (messages) =>
  messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

export async function POST(request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[Noor AI] GROQ_API_KEY is missing");
    return NextResponse.json({ error: "AI service is not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = sanitizeMessages(body?.messages);
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
        temperature: 0.4,
        max_tokens: 800,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Noor AI] Groq API error ${response.status}:`, errorText);
      return NextResponse.json({ error: "AI request failed" }, { status: response.status });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("[Noor AI] Groq API exception:", error);
    return NextResponse.json({ error: "AI request failed" }, { status: 502 });
  }
}
