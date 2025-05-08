import * as XLSX from 'xlsx';
import moment from 'moment';
import { message } from 'antd';

/**
 * Handle file upload and parse Excel data.
 * @param {File} file - The uploaded file.
 * @param {Object} options - Options for processing the file.
 * @param {Object} options.columnMapping - Mapping between Excel headers and API fields.
 * @param {Function} options.setParsedData - Function to set parsed data.
 * @param {Function} options.validateData - Function to validate parsed data.
 * @param {Function} options.setShowPreview - Function to toggle preview visibility.
 * @param {Function} options.setFileList - Function to update the file list.
 * @param {boolean} options.addCurrentDate - Whether to add the current date to each row.
 */
export const handleFileUpload = (file, {
  columnMapping,
  setParsedData,
  validateData,
  setShowPreview,
  setFileList,
  addCurrentDate
}) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel';

  if (!isExcel) {
    message.error('Chỉ hỗ trợ tải lên file Excel!');
    return false;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '', // Default value for empty cells
      });

      if (jsonData.length < 2) {
        message.error('File không chứa dữ liệu!');
        setFileList([]);
        return;
      }

      const headers = jsonData[0];
      const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== ''));

      const processedData = rows.map((row, index) => {
        const item = {};
        headers.forEach((header, colIndex) => {
          const apiField = columnMapping[header];
          if (apiField) {
            let value = row[colIndex];
            if (apiField === 'tong_no_phai_tra' && value !== '') {
              if (typeof value === 'string') {
                value = value.replace(/[^\d.-]/g, '');
              }
              value = parseFloat(value) || 0;
            }
            item[apiField] = value;
          }
        });

        item.trang_thai = 'Đang hoạt động';
        if (addCurrentDate) {
          item.ngay_them_vao = moment().format('YYYY-MM-DD');
        }
        item.key = index;

        return item;
      });

      setParsedData(processedData);
      validateData(processedData);
      setShowPreview(true);

      message.success(`File "${file.name}" đã được tải lên thành công!`);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      message.error('Có lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file!');
    }
  };

  reader.onerror = () => {
    message.error('Không thể đọc file!');
  };

  reader.readAsArrayBuffer(file);
  setFileList([file]);

  return false;
};