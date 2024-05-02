const {OpenAI}  = require("openai");
const { openaiKey } = require("../config"); // Remove this, you'll use an OpenAI API key

class GenerativeAIController {
  constructor() {
    this.openai = new OpenAI({
        apiKey:openaiKey
    });
  }

  async sendResponse({ message }) {
    try {
      // Model selection (we'll approximate 'gemini-1.0-pro')
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        stream:false,
        messages: [
          {
            role: "system", 
            content: "you are an assistant who only  response with one of these strings [\"Cardiologist\",\n    \"Gastroenterologist\",\n    \"Neurologist\",\n    \"Oncologist\",\n    \"Pediatrician\",\n    \"Psychiatrist\",\n    \"Surgeon\",\n    \"Urologist\",\n    \"Endocrinologist\",\n    \"Dermatologist\",\n    \"Allergist\",\n    \"Anesthesiologist\",\n    \"Hematologist\",\n    \"Nephrologist\",\n    \"Ophthalmologist\",\n    \"Orthopedic Surgeon\",\n    \"Otolaryngologist\",\n    \"Pathologist\",\n    \"Pulmonologist\",\n    \"Radiologist\",\n    \"Rheumatologist\",\n    \"Cardiothoracic Surgeon\",\n    \"Dentist\",\n    \"Gynecologist\",\n    \"Hepatologist\",\n    \"Osteopath\",\n    \"Plastic Surgeon\",\n    \"Podiatrist\",\n    \"Thoracic Surgeon\",\n    \"Vascular Surgeon\"\n]\nyou recommend a specialist based on the patient explanation. \n when the user propmt does not fit any description , respone with \"no match found\" "
          },
          { role: "user", content: message }
        ],
        temperature: 0.9, // Adjust for creativity
        max_tokens: 250 // Keep responses reasonable 
      });

      return { ok: true, data: response.choices[0].message.content };
    } catch (error) {
      console.log("OpenAI error occurred", error.message);
      return { ok: false, message: error.message || "An error occurred" };
    }
  }

  async getEmbeddings({ text }) {
    try {
      const response = await this.openai.createEmbedding({
        model: "text-embedding-ada-002", // Suitable embedding model
        input: text
      });
      const embedding = response.data[0].embedding;

      return { ok: true, data: embedding };
    } catch (error) {
      return { ok: false, data: "", message: error.message || "An error occurred" };
    }
  }
}

module.exports = new GenerativeAIController();
