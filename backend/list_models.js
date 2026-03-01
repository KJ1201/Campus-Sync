require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Listing models...");
    try {
        const modelList = await genAI.listModels();
        for (const model of modelList.models) {
            console.log(model.name);
        }
    } catch (e) {
        console.error("Listing models failed:", e.message);
    }
}

run();
