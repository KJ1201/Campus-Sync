require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = "gemini-1.5-flash-latest";
    console.log(`Trying ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    try {
        const result = await model.generateContent("Say hello");
        console.log("Response:", result.response.text());
        console.log(`✅ ${modelName} works!`);
    } catch (e) {
        console.error(`${modelName} failed:`, e.message);
    }
}

run();
