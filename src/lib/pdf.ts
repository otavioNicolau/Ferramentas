import { PDFDocument } from 'pdf-lib';

/**
 * Check if a provided file is a valid PDF
 */
export const isPdfFile = (file?: File | null): boolean => {
  return !!file && file.type === 'application/pdf';
};

/**
 * Get the number of pages in a PDF file
 */
export const getPdfPageCount = async (file: File): Promise<number> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  return pdfDoc.getPageCount();
};

/**
 * Merge multiple PDF files into a single PDF and return its bytes
 */
export const mergePdfFiles = async (files: File[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
};
