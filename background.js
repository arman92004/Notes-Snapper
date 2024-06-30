chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'openPopup') {
    chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 400,
      height: 200
    });
  }
});
