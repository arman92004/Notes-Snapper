(function() {
  // Create and style capture button
  const captureButton = document.createElement('button');
  captureButton.id = 'capture-button';
  captureButton.innerText = 'Snap';
  Object.assign(captureButton.style, {
    position: 'fixed',
    top: '10px',
    right: '13%',
    zIndex: '9999',
    padding: '10px',
    backgroundColor: '#ff0000',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    borderRadius: '10px', // Rounded corners
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Drop shadow
  });

  document.body.appendChild(captureButton);

  // Create and style container for captures
  const capturesContainer = document.createElement('div');
  capturesContainer.id = 'captures-container';
  Object.assign(capturesContainer.style, {
    position: 'fixed',
    top: '60px',
    right: '20px',
    width: '30%',
    maxHeight: '70vh',
    overflowY: 'auto',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    padding: '10px',
    zIndex: '9999',
    borderRadius: '10px', // Rounded corners
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Drop shadow
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    display: 'none'
  });
  
  document.body.appendChild(capturesContainer);

  // Create and style button to delete all frames
  const deleteAllButton = document.createElement('button');
  deleteAllButton.id = 'delete-all-button';
  deleteAllButton.innerText = 'New Notebook';
  Object.assign(deleteAllButton.style, {
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#dc3545',
    marginRight: "10px",
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    borderRadius: '10px', // Rounded corners
  });
  
  capturesContainer.appendChild(deleteAllButton);

  // Create and style button to open popup
  const openPopupButton = document.createElement('button');
  openPopupButton.id = 'open-popup-button';
  openPopupButton.innerText = 'Save notes';
  Object.assign(openPopupButton.style, {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    borderRadius: '10px', // Rounded corners
  });
  capturesContainer.appendChild(openPopupButton);
  openPopupButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });


  // Create frames container to hold the frames
  const framesContainer = document.createElement('div');
  framesContainer.id = 'frames-container';
  capturesContainer.appendChild(framesContainer);

  // Create and style button to collapse/expand captures container
  const toggleButton = document.createElement('button');
  toggleButton.id = 'toggle-button';
  toggleButton.innerText = 'Notes';
  Object.assign(toggleButton.style, {
    position: 'fixed',
    top: '10px',
    right: '18%',
    zIndex: '9999',
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px'
  });
  document.body.appendChild(toggleButton);

  toggleButton.addEventListener('click', () => {
    capturesContainer.style.display = capturesContainer.style.display === 'none' ? 'block' : 'none';
  });

  captureButton.addEventListener('click', () => {
    const video = document.querySelector('video');
    if (video && video.currentTime > 0 && video.currentTime < video.duration) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameData = canvas.toDataURL('image/png');
      const timestamp = video.currentTime;

      chrome.storage.local.get({ frames: [] }, (result) => {
        const frames = result.frames;
        frames.push({ data: frameData, text: '', timestamp: timestamp });
        chrome.storage.local.set({ frames: frames }, () => {
          console.log('Frame captured and saved to local storage!');
          // addFrameToUI({ data: frameData, text: '', timestamp: timestamp }, frames.length - 1, frames.length);
          updateFramesUI(frames)
        });
      });
    } else {
      console.log('No video element found or video is not playing.');
    }
  });

  // Event listener for deleting all frames
  deleteAllButton.addEventListener('click', () => {
    chrome.storage.local.set({ frames: [] }, () => {
      console.log('All frames deleted.');
      updateFramesUI([]);
    });
  });

  function loadFrames() {
    chrome.storage.local.get({ frames: [] }, (result) => {
      const frames = result.frames;
      frames.forEach((frame, index) => {
        addFrameToUI(frame, index, frames.length);
      });
    });
  }

  function addFrameToUI(frame, index, framesLength) {
    const captureDiv = document.createElement('div');
    captureDiv.className = 'capture';
    captureDiv.style.marginBottom = '10px';

    const img = document.createElement('img');
    img.src = frame.data;
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.border = "2px solid black"


    const timestampDiv = document.createElement('div');
    timestampDiv.innerText = `Captured at: ${formatTimestamp(frame.timestamp)}`;
    timestampDiv.style.fontSize = '12px';
    timestampDiv.style.color = '#555';

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Add notes here...';
    textarea.value = frame.text;
    textarea.style.width = '100%';
    textarea.style.height = '60px';
    textarea.style.marginTop = '10px';
    textarea.addEventListener('input', () => updateFrameText(index, textarea.value));

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'capture-controls';
    controlsDiv.style.marginTop = '10px';

    if (index > 0) {
      const upButton = document.createElement('button');
      upButton.innerText = '↑';
      upButton.style.marginRight = '5px';
      upButton.onclick = () => moveFrame(index, -1);
      controlsDiv.appendChild(upButton);
    }

    if (index < framesLength - 1) {
      const downButton = document.createElement('button');
      downButton.innerText = '↓';
      downButton.style.marginRight = '5px';
      downButton.onclick = () => moveFrame(index, 1);
      controlsDiv.appendChild(downButton);
    }

    const removeButton = document.createElement('button');
    removeButton.innerText = 'Remove';
    removeButton.onclick = () => removeFrame(index);
    controlsDiv.appendChild(removeButton);

    captureDiv.appendChild(img);
    captureDiv.appendChild(timestampDiv);
    captureDiv.appendChild(textarea);
    captureDiv.appendChild(controlsDiv);

    framesContainer.appendChild(captureDiv);
  }

  function formatTimestamp(seconds) {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8); // HH:MM:SS format
  }

  function updateFrameText(index, text) {
    chrome.storage.local.get({ frames: [] }, (result) => {
      const frames = result.frames;
      frames[index].text = text;
      chrome.storage.local.set({ frames: frames });
    });
  }

  function moveFrame(index, direction) {
    chrome.storage.local.get({ frames: [] }, (result) => {
      const frames = result.frames;
      if ((index + direction >= 0) && (index + direction < frames.length)) {
        const temp = frames[index];
        frames[index] = frames[index + direction];
        frames[index + direction] = temp;
        chrome.storage.local.set({ frames: frames }, () => {
          updateFramesUI(frames);
        });
      }
    });
  }

  function removeFrame(index) {
    chrome.storage.local.get({ frames: [] }, (result) => {
      const frames = result.frames;
      frames.splice(index, 1);
      chrome.storage.local.set({ frames: frames }, () => {
        updateFramesUI(frames);
      });
    });
  }

  function updateFramesUI(frames) {
    framesContainer.innerHTML = ''; // Clear only the frames container
    frames.forEach((frame, index) => {
      addFrameToUI(frame, index, frames.length);
    });
  }

  // Load frames on script load
  loadFrames();
})();
