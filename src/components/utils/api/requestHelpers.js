export const fetchDataList = async (url) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Lỗi server: ${response.status}`);
  const data = await response.json();
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('Dữ liệu không hợp lệ từ server');
  }
  return data.data;
};

export const updateItemById = async (url, values) => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!response.ok) throw new Error(`Lỗi cập nhật: ${response.status}`);
  return await response.json();
};

export const createItem = async (url, values) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });

  console.log('HTTP Status:', response.status); // Log mã trạng thái HTTP
  console.log('HTTP Response Headers:', response.headers); // Log headers phản hồi

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = `Lỗi thêm mới: ${response.status}`;
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      console.error('Chi tiết lỗi từ server:', errorData); // Log chi tiết lỗi từ server
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

export const deleteItemById = async (url) => {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = `Lỗi xóa: ${response.status}`;
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return await response.json().catch(() => ({})); // Trường hợp không trả JSON
};
