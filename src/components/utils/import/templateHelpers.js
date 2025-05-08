import * as XLSX from 'xlsx';

/**
 * Download an Excel template file.
 * @param {Array} columns - Array of column headers.
 * @param {Array} sampleData - Array of sample data rows.
 * @param {string} fileName - Name of the file to download.
 */
export const downloadTemplate = (columns, sampleData, fileName) => {
  // Create worksheet with header and sample data
  const ws = XLSX.utils.aoa_to_sheet([columns, ...sampleData]);

  // Set column widths
  ws['!cols'] = columns.map(() => ({ wch: 25 })); // Adjust width as needed

  // Create workbook and add worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  // Generate file and trigger download
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};