const { Ollama } = require('ollama');
const { ollamaUri } = require("../config");


class OllamaController {
    constructor() {
        this.model = "gemma:7b"
        this.ollama = new Ollama({ host: ollamaUri })
        this.contetx = [
            106,
            1645,
            108,
            4747,
            708,
            671,
            20409,
            1064,
            1297,
            139,
            4250,
            675,
            974,
            576,
            1450,
            18935,
            10890,
            114036,
            18311,
            824,
            108,
            141,
            235281,
            171423,
            1068,
            39538,
            824,
            108,
            141,
            235281,
            66332,
            18311,
            824,
            108,
            141,
            235281,
            2122,
            178771,
            824,
            108,
            141,
            235281,
            235295,
            10707,
            146412,
            824,
            108,
            141,
            235281,
            207029,
            2099,
            824,
            108,
            141,
            235281,
            8605,
            18426,
            824,
            108,
            141,
            235281,
            158035,
            18311,
            824,
            108,
            141,
            235281,
            3898,
            816,
            51345,
            18311,
            824,
            108,
            141,
            235281,
            8636,
            771,
            39538,
            824,
            108,
            141,
            235281,
            2430,
            27021,
            694,
            824,
            108,
            141,
            235281,
            1969,
            138728,
            536,
            18311,
            824,
            108,
            141,
            235281,
            45495,
            1817,
            18311,
            824,
            108,
            141,
            235281,
            52255,
            235259,
            514,
            18311,
            824,
            108,
            141,
            235281,
            235302,
            47118,
            825,
            18311,
            824,
            108,
            141,
            235281,
            102113,
            105827,
            88367,
            824,
            108,
            141,
            235281,
            235302,
            20887,
            90296,
            39538,
            824,
            108,
            141,
            235281,
            90115,
            18311,
            824,
            108,
            141,
            235281,
            57284,
            1350,
            39538,
            824,
            108,
            141,
            235281,
            16507,
            18311,
            824,
            108,
            141,
            235281,
            62546,
            176460,
            18311,
            824,
            108,
            141,
            235281,
            114036,
            1741,
            66609,
            88367,
            824,
            108,
            141,
            235281,
            223219,
            824,
            108,
            141,
            235281,
            235319,
            35028,
            178771,
            824,
            108,
            141,
            235281,
            70849,
            1817,
            18311,
            824,
            108,
            141,
            235281,
            122786,
            62177,
            824,
            108,
            141,
            235281,
            65660,
            88367,
            824,
            108,
            141,
            235281,
            1975,
            112040,
            2099,
            824,
            108,
            141,
            235281,
            46705,
            66609,
            88367,
            824,
            108,
            141,
            235281,
            234251,
            88367,
            235281,
            108,
            235307,
            108,
            4747,
            5656,
            476,
            25336,
            3482,
            611,
            573,
            7679,
            15844,
            235265,
            235248,
            108,
            1185,
            573,
            2425,
            5790,
            3268,
            1721,
            780,
            3806,
            1089,
            5966,
            1688,
            1491,
            785,
            675,
            664,
            956,
            4810,
            1942,
            235281,
            107,
            108,
            106,
            2516,
            108,
            5958,
            3658,
            476,
            9091,
            5966,
            576,
            573,
            7679,
            235303,
            235256,
            6910,
            11115,
            689,
            12447,
            235265,
            107,
            108
        ]
    }

    async getEmbeddings({ message }) {
        try {
            const result = await this.ollama.embeddings({ model: this.model, prompt: message });
            return { ok: true, data: result.embedding, };
        } catch (error) {
            return { ok: false, data: "", message: error.message || "An error occurred" };
        }
    }
    async getChatCompletion({ message }) {
        try {
            const result = await this.ollama.generate({ model: this.model, prompt:message, context: this.contetx, stream: false });

            return { ok: true, data: result.response, };
        } catch (error) {
            return { ok: false, data: "", message: error.message || "An error occurred" };
        }
    }
}

module.exports = new OllamaController();
