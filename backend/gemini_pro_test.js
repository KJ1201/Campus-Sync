require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Trying gemini-pro...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    try {
        const result = await model.generateContent("Say hello");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.error("Gemini-pro failed:", e.message);
    }
}

run();
