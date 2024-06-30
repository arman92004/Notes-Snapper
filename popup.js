document.addEventListener('DOMContentLoaded', () => {
  const convertButton = document.getElementById('convert-button');

  convertButton.addEventListener('click', () => {
    chrome.storage.local.get({ frames: [] }, (result) => {
      const frames = result.frames;
      if (frames.length === 0) {
        window.close();
        return;
      }

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height;
      const lineHeight = 10;
      const imageHeight = 130;
      const imageWidth = 180;
      const imageX = 10;
      let currentHeight = 10;

      frames.forEach((frame, index) => {
        if (index > 0) {
          pdf.addPage();
          currentHeight = 10;
        }

        pdf.text(`Captured at: ${formatTimestamp(frame.timestamp)}`, 10, currentHeight);
        currentHeight += lineHeight;

        pdf.addImage(frame.data, 'PNG', imageX, currentHeight, imageWidth, imageHeight);

        pdf.rect(imageX, currentHeight, imageWidth, imageHeight);

        currentHeight += imageHeight + 10;

        const notes = pdf.splitTextToSize(frame.text, 180);
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

function formatTimestamp(seconds) {
  const date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substring(11, 8);
}
