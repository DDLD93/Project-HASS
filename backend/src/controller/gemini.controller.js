const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { geminiKey } = require("../config");

class GenerativeAIController {
  constructor() {
    this.genAI = new GoogleGenerativeAI(geminiKey);
  }

  async sendResponse({ message }) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
      const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          {
            role: "user",
            parts: [{ text: "you are an assistant who only  response with one of these strings [\"Cardiologist\",\n    \"Gastroenterologist\",\n    \"Neurologist\",\n    \"Oncologist\",\n    \"Pediatrician\",\n    \"Psychiatrist\",\n    \"Surgeon\",\n    \"Urologist\",\n    \"Endocrinologist\",\n    \"Dermatologist\",\n    \"Allergist\",\n    \"Anesthesiologist\",\n    \"Hematologist\",\n    \"Nephrologist\",\n    \"Ophthalmologist\",\n    \"Orthopedic Surgeon\",\n    \"Otolaryngologist\",\n    \"Pathologist\",\n    \"Pulmonologist\",\n    \"Radiologist\",\n    \"Rheumatologist\",\n    \"Cardiothoracic Surgeon\",\n    \"Dentist\",\n    \"Gynecologist\",\n    \"Hepatologist\",\n    \"Osteopath\",\n    \"Plastic Surgeon\",\n    \"Podiatrist\",\n    \"Thoracic Surgeon\",\n    \"Vascular Surgeon\"\n]\nyou recommend a specialist based on the patient explanation" }],
          },
          {
            role: "model",
            parts: [{ text: "Pediatrician" }],
          },
          {
            role: "user",
            parts: [{ text: "when the user propmt does not fit any description , respone with \"no match found\"" }],
          },
          {
            role: "model",
            parts: [{ text: "no match found" }],
          },
          {
            role: "user",
            parts: [{ text: "i have been having migrine in the last five hours" }],
          },
          {
            role: "model",
            parts: [{ text: "Neurologist" }],
          },
          {
            role: "user",
            parts: [{ text: "my skin is always tender and dry" }],
          },
          {
            role: "model",
            parts: [{ text: "Dermatologist" }],
          },
        ],
      });

      const result = await chat.sendMessage(message);
      const response = result.response;


      return { ok: true, data: response.text(), };
    } catch (error) {
      console.log("Gemini error occurred",error.message);
      return { ok: false, message: error.message };
    }
  }
  async getEmbeddings({ text }) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "embedding-001" });

      const result = await model.embedContent(text);
      const embedding = result.embedding;

      return { ok: true, data: embedding.values, };
    } catch (error) {
      return { ok: false, data: "", message: error.message || "An error occurred" };
    }
  }
}

module.exports = new GenerativeAIController();


