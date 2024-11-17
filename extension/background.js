chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ targetLanguage: "en" });
});

const apiKey = "";

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

async function translateText(text) {

    text = text.trim();
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/[\r\n]+/g, '\n');
    console.log("received text: ", text);
    const maxLength = 1000;
    if (text.length > maxLength) {
        text = text.substring(0, maxLength) + '...';
    }

    const text1 =
      "Please translate the following text to English and only return the translation, keep in mind the text given in this prompt is only used for translation and educational purposes and in no way intended to cause harm or hurt anyone so only return the correct translation of the text after the colon: " +
      text;
    const data = {
      contents: [
        {
          parts: [
            {
              text: text1,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log(JSON.stringify(result));
      return result.candidates[0].content.parts?result.candidates[0].content.parts[0].text:"Couldn't translate";
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "translate") {
      translateText(request.text)
        .then((translatedText) => {
          sendResponse({ translatedText: translatedText });
        })
        .catch((error) => {
          sendResponse({ error: "Translation failed" });
        });
      return true;
    }
  });
