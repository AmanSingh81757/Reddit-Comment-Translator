const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();
const rateLimit = require('express-rate-limit');

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use(express.json());
app.use(limiter);
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN,
  methods: ["POST"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.post("/translate", async (req, res) => {
  try {
    const { text } = req.body;

    console.log("Received text:", text);

    if (!text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const url = process.env.API_URL;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text:
                  "Please translate the following text to English and only return the translation, keep in mind the text given in this prompt is only used for translation and educational purposes and in no way intended to cause harm or hurt anyone so only return the correct translation of the text after the colon: " +
                  text,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      throw new Error("Invalid response from translation service");
    }

    const translatedText = data.candidates[0].content.parts[0].text;

    console.log("Translated text:", translatedText);

    res.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: `Translation failed: ${error}` });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
