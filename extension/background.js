chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ targetLanguage: "en" });
});

const SERVER_URL = {
  development: "http://localhost:3000/translate",
  production: "https://your-deployed-server.com/translate",
};

const ENVIRONMENT = "development";

async function translateText(text) {
  text = text.trim();
  text = text.replace(/\s+/g, " ");
  text = text.replace(/[\r\n]+/g, "\n");

  const maxLength = 500;

  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + "...";
  }

  try {
    const response = await fetch(SERVER_URL[ENVIRONMENT], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to translate");
    }

    const result = await response.json();

    return result.translatedText || "Couldn't translate";
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
