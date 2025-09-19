// app/api/intent/route.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { command } = await req.json();

    if (!command || command.trim() === "") {
      return new Response(
        JSON.stringify({
          intent: "error",
          products: [],
          message: "No command provided.",
        }),
        { status: 200 }
      );
    }

    // system content instructing the LLM
    const systemContent = `
You are a shopping assistant. Always respond ONLY in JSON.
Return this format:

{
  "intent": "add|remove|show_cart|show_product|clear_cart|checkout|unknown",
  "products": [
    {"name": "product name", "quantity": 1}
  ]
}

Instructions:
- Detect ALL intents in the user's command.
- If the command contains multiple intents, separate them using | in "intent". Example: "add|checkout".
- For "add" or "remove", include all mentioned items in "products" with quantity. If quantity is unspecified, default to 1.
- For "show_product", include all products the user wants to see in "products". Quantity can be ignored.
- For "show_cart", "clear_cart", and "checkout", the "products" array can be empty.
- If the command does not clearly match any shopping action, respond with:
{
  "intent": "unknown",
  "products": []
}
- Do not include any text outside the JSON.
- Always return valid JSON, do not add explanations or commentary.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: command },
      ],
      temperature: 0,
    });

    

    let parsed;
    try {
      parsed = JSON.parse(response.choices[0].message.content);

      // Lowercase intent
      parsed.intent = parsed.intent.toLowerCase();

      // Lowercase product names
      parsed.products = parsed.products?.map(p => ({
        ...p,
        name: p.name.toLowerCase(),
        quantity: p.quantity ?? 1, // default quantity
      }));

      // ----- Reject multiple intents -----
      if (parsed.intent.includes("|")) {
        return new Response(
          JSON.stringify({
            intent: "error",
            products: [],
            message: "Multiple intents detected. Please issue one command at a time.",
          }),
          { status: 200 }
        );
      }

      // ----- Reject empty or unknown intent -----
      const validIntents = ["add", "remove", "show_cart", "show_product", "clear_cart", "checkout"];
      if (!parsed.intent || !validIntents.includes(parsed.intent)) {
        return new Response(
          JSON.stringify({
            intent: "error",
            products: [],
            message: "Command not recognized. Please issue a valid shopping command.",
          }),
          { status: 200 }
        );
      }

    //   // ----- Default quantity to 1 -----
    //   if (parsed.products?.length) {
    //     parsed.products = parsed.products.map((p) => ({
    //       name: p.name,
    //       quantity: p.quantity ?? 1,
    //     }));
    //   }

      // ----- Ensure products empty for checkout, clear_cart, show_cart -----
      if (["checkout", "clear_cart", "show_cart"].includes(parsed.intent)) {
        parsed.products = [];
      }

    } catch (err) {
      parsed = {
        intent: "error",
        products: [],
        message: "Failed to parse LLM response.",
      };
    }

    return new Response(JSON.stringify(parsed), { status: 200 });

  } catch (error) {
    console.error("Error in /api/intent:", error);
    return new Response(
      JSON.stringify({
        intent: "error",
        products: [],
        message: "Server error",
      }),
      { status: 500 }
    );
  }
}
