/**
 * Validate data rows based on required fields and custom rules.
 * @param {Array} data - Array of data rows to validate.
 * @param {Array} requiredFields - List of required fields.
 * @param {Function} getFieldLabel - Function to get the label of a field.
 * @param {Function} setErrorItems - Function to set error items.
 * @returns {Array} - Array of error items.
 */
export const validateData = (data, requiredFields, getFieldLabel, setErrorItems) => {
    const errors = [];
    data.forEach((item, index) => {
      const itemErrors = [];
      requiredFields.forEach(field => {
        if (!item[field] || item[field].toString().trim() === '') {
          itemErrors.push(`Thiếu trường "${getFieldLabel(field)}"`);
        }
      });
      if (item.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) {
        itemErrors.push('Email không đúng định dạng');
      }
      if (item.so_dien_thoai && !/^\d{9,12}$/.test(item.so_dien_thoai.toString().replace(/[^0-9]/g, ''))) {
        itemErrors.push('Số điện thoại không đúng định dạng');
      }
      if (itemErrors.length > 0) {
        errors.push({
          index,
          ma_nha_cung_cap: item.ma_nha_cung_cap || `Hàng ${index + 2}`,
          ten_nha_cung_cap: item.ten_nha_cung_cap || '(Không có tên)',
          errors: itemErrors
        });
      }
    });
    setErrorItems(errors);
    return errors;
  };
  
  /**
   * Get the label of a field based on column mapping.
   * @param {string} apiField - The API field name.
   * @param {Object} columnMapping - Mapping between column headers and API fields.
   * @returns {string} - The label of the field.
   */
  export const getFieldLabel = (apiField, columnMapping) => {
    for (const [key, value] of Object.entries(columnMapping)) {
      if (value === apiField) {
        return key;
      }
    }
    return apiField;
  };