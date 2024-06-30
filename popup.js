document.addEventListener('DOMContentLoaded', () => {
  const convertButton = document.getElementById('convert-button');

  // Convert to PDF
  convertButton.addEventListener('click', () => {
    chrome.storage.local.get({ frames: [] }, (result) => {
      const frames = result.frames;
      if (frames.length === 0) {
        // alert('No frames captured');
        window.close();
        return;
      }

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height;
      const lineHeight = 10;
      const imageHeight = 130; // Set your desired image height here
      const imageWidth = 180; // Set your desired image width here
      const imageX = 10; // X position of the image
      let currentHeight = 10;

      frames.forEach((frame, index) => {
        if (index > 0) {
          pdf.addPage();
          currentHeight = 10;
        }
        pdf.text(`Captured at: ${formatTimestamp(frame.timestamp)}`, 10, currentHeight);
        currentHeight += lineHeight;

        pdf.addImage(frame.data, 'PNG', imageX, currentHeight, imageWidth, imageHeight);
        // Add a border around the image
        pdf.rect(imageX, currentHeight, imageWidth, imageHeight);

        currentHeight += imageHeight + 10; // Adjust based on image height and spacing



        // Handle text wrapping and pagination
        const notes = pdf.splitTextToSize(frame.text, 180); // 180 is the width of the text area
        notes.forEach((line) => {
          if (currentHeight + lineHeight > pageHeight) {
            pdf.addPage();
            currentHeight = 10;
          }
          pdf.text(line, 10, currentHeight);
          currentHeight += lineHeight;
        });
      });

      const titleInput = document.getElementById('title-input');
      const title = titleInput ? titleInput.value : 'captured_frames';
      pdf.save(`${title}.pdf`);
      window.close();
    });
  });
});

// Function to format the timestamp
function formatTimestamp(seconds) {
  const date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8); // HH:MM:SS format
}
