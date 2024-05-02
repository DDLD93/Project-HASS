const {
    APP_PORT,
    MONGO_URI,
    JWT_SECRET,
    GEMINI_KEY,
    OPENAI_KEY
} = process.env

module.exports = {
    appPort: APP_PORT | 4000,
    mongoURI: MONGO_URI || "mongodb://localhost:27017/hospitaldb",
    jwtSecret: JWT_SECRET || "klhikhukgyurttetyuiouyguyfyugjoojoyuiyuiyiyikh",
    geminiKey: GEMINI_KEY,
    ollamaUri: "https://ollama.ndeportal.ng",
    openaiKey: OPENAI_KEY
}