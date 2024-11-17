console.log("Reddit Comment Translator content script loaded");

function addTranslateButton(comment) {
  if (comment.querySelector('.translate-btn')) return;

  const translateBtn = document.createElement('span');
  translateBtn.textContent = 'Translate';
  translateBtn.className = 'translate-btn';
  translateBtn.style.fontSize = '12px';
  translateBtn.style.padding = '2px 5px';
  translateBtn.style.color = 'white';
  translateBtn.style.border = '1px solid white';
  translateBtn.style.borderRadius = '3px';
  translateBtn.style.cursor = 'pointer';
  translateBtn.style.display = 'none';

  translateBtn.addEventListener('click', function() {
    translateBtn.textContent = 'Translating...';
    const paragraphs = comment.querySelectorAll('p');
    const commentText = Array.from(paragraphs).map(p => p.textContent).join('\n');
    chrome.runtime.sendMessage({ action: 'translate', text: commentText }, response => {
      if (response.translatedText) {
        translateBtn.textContent = 'Translated comment below:';
        const translatedDiv = comment.querySelector('.translated-text') || document.createElement('div');
        translatedDiv.className = 'translated-text';
        translatedDiv.textContent = response.translatedText;
        translatedDiv.style.fontStyle = 'italic';
        translatedDiv.style.color = 'white';
        translatedDiv.style.marginTop = '5px';
        translatedDiv.style.border = '1px solid white';
        translatedDiv.style.padding = '2px';
        comment.appendChild(translatedDiv);
      } else if (response.error) {
        console.error("Translation error:", response.error);
      }
    });
  });

  const lastPTag = comment.querySelector('p:last-of-type');
  if (lastPTag && lastPTag.parentNode) {
    lastPTag.parentNode.insertBefore(translateBtn, lastPTag.nextSibling);
  }

  comment.addEventListener('mouseenter', () => {
    translateBtn.style.display = 'inline-block';
  });

  comment.addEventListener('mouseleave', () => {
    const translatedDiv = comment.querySelector('.translated-text');
    if (!translatedDiv) {
      translateBtn.style.display = 'none';
    }
    else {
      translateBtn.style.display = 'inline-block';
    }
  });
}

function addTranslateButtons() {
  const comments = document.querySelectorAll('.md.text-14');
  comments.forEach(addTranslateButton);
}

function initTranslator() {
  addTranslateButtons();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && node.matches('.md.text-14')) {
            addTranslateButton(node);
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

initTranslator();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'initTranslator') {
    initTranslator();
    sendResponse({success: true});
  }
  return true;
});