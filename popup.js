document.addEventListener('DOMContentLoaded', function() {
  const initButton = document.createElement('button');
  initButton.style.backgroundColor = '#FF4500';
  initButton.style.color = 'white';
  initButton.style.border = 'none';
  initButton.style.padding = '10px 20px';
  initButton.style.fontSize = '16px';
  initButton.style.cursor = 'pointer';
  initButton.style.borderRadius = '5px';
  initButton.style.display = 'block';
  initButton.style.margin = '0 auto';
  initButton.textContent = 'Initialize Translator';
  initButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "initTranslator"}, function(response) {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError.message);
          } else if (response && response.success) {
            console.log("Translator initialized successfully");
          } else {
            console.log("Translator initialization failed or no response received");
          }
        });
      } else {
        console.error("No active tab found");
      }
    });
  });
  document.body.appendChild(initButton);
});