require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Actually, some SDK versions don't take apiVersion in constructor.
    // Let's try explicitly gemini-1.5-flash which SHOULD be stable on v1.
    console.log("Trying gemini-1.5-flash with default SDK settings...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    try {
        const result = await model.generateContent("Say hello");
        console.log("Response:", result.response.text());
        console.log("✅ gemini-1.5-flash works!");
    } catch (e) {
        if (e.message.includes("404")) {
            console.log("404 detected. Trying gemini-pro (v1) via explicit endpoint...");
            // Some users fix this by using a specific model name gemini-1.5-flash-001
            const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
            try {
                const result2 = await model2.generateContent("Say hello");
                console.log("Response (001):", result2.response.text());
            } catch (e2) {
                console.error("All attempts failed:", e2.message);
            }
        } else {
            console.error("Failure:", e.message);
        }
    }
}

run();
