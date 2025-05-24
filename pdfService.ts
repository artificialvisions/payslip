
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportPayslipToPDF = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    // Temporarily ensure content is fully visible for capture if it's in a scrollable container
    const payslipContainer = document.getElementById('payslip-render-area');
    let originalOverflow = '';
    let originalHeight = '';

    if (payslipContainer) {
        originalOverflow = payslipContainer.style.overflow;
        originalHeight = payslipContainer.style.height;
        payslipContainer.style.overflow = 'visible';
        payslipContainer.style.height = 'auto';
    }
    
    // Add a small delay to ensure rendering completes, especially if styles were changed
    await new Promise(resolve => setTimeout(resolve, 100));


    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // If you have external images
      backgroundColor: '#0A0A10', // Match payslip background (darkCardBg) for consistency
      onclone: (document) => {
        // Ensure text color is appropriate for PDF if it relies on external CSS not captured
        const allTextElements = document.querySelectorAll('p, span, div, td, th, h1, h2, h3, h4, h5, h6, li');
        allTextElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            // Example: If you need to force a specific color for PDF visibility
            // if (getComputedStyle(htmlEl).color === 'rgb(229, 231, 235)') { // text-gray-200
            //      htmlEl.style.color = 'black'; // Or a dark gray for printing
            // }
        });
      }
    });

    if (payslipContainer) {
        payslipContainer.style.overflow = originalOverflow;
        payslipContainer.style.height = originalHeight;
    }

    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt', // points
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = imgProps.width;
    const imgHeight = imgProps.height;
    
    // Calculate width and height with padding
    const padding = 20; // 20 points padding
    const effectivePdfWidth = pdfWidth - 2 * padding;
    const effectivePdfHeight = pdfHeight - 2 * padding;

    let newImgWidth = imgWidth;
    let newImgHeight = imgHeight;

    const ratio = Math.min(effectivePdfWidth / imgWidth, effectivePdfHeight / imgHeight);
    newImgWidth = imgWidth * ratio;
    newImgHeight = imgHeight * ratio;
    
    const x = (pdfWidth - newImgWidth) / 2;
    const y = (pdfHeight - newImgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, newImgWidth, newImgHeight);
    pdf.save(filename);

  } catch (error) {
    console.error('Error exporting PDF:', error);
    alert('Si è verificato un errore durante l\'esportazione in PDF.');
  }
};