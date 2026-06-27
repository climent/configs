/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

export async function exportPresentationToPDF(
  presentationTitle: string,
  slideIds: string[],
  onProgress?: (current: number, total: number) => void,
  onBeforeCapture?: (index: number) => Promise<void>
): Promise<void> {
  const totalSlides = slideIds.length;
  if (totalSlides === 0) {
    throw new Error('No slides to export');
  }

  // Create standard widescreen (16:9) landscape presentation PDF
  // Widescreen px dimensions can be standard 1280x720.
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [1280, 720],
    compress: true,
  });

  for (let i = 0; i < totalSlides; i++) {
    if (onBeforeCapture) {
      await onBeforeCapture(i);
    }

    const slideId = slideIds[i];
    const element = document.getElementById(`slide-render-${slideId}`);

    if (!element) {
      console.warn(`Slide element with ID slide-render-${slideId} not found`);
      continue;
    }

    if (onProgress) {
      onProgress(i + 1, totalSlides);
    }

    // Capture slide as high-DPI image
    const canvas = await html2canvas(element, {
      scale: 2, // crisp fonts and vector layouts
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.9);

    if (i > 0) {
      pdf.addPage([1280, 720], 'landscape');
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, 1280, 720);
  }

  const fileName = `${presentationTitle.trim().replace(/[^a-z0-9_-]/gi, '_') || 'presentation'}.pdf`;
  pdf.save(fileName);
}
