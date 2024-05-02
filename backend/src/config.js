const {
    APP_PORT,
    MONGO_URI,
    JWT_SECRET,
    GEMINI_KEY,
    OPENAI_KEY
} = process.env

module.exports = {
    appPort: APP_PORT | 4000,
    mongoURI: MONGO_URI || "mongodb+srv://ddld93:1234567890@cluster0.fljiocn.mongodb.net/services?retryWrites=true&w=majority",
    jwtSecret: JWT_SECRET || "klhikhukgyurttetyuiouyguyfyugjoojoyuiyuiyiyikh",
    geminiKey: GEMINI_KEY,
    ollamaUri: "https://ollama.ndeportal.ng",
    openaiKey: OPENAI_KEY
}