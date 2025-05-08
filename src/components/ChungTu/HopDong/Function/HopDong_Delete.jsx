import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { deleteItemById } from '../../../utils/api/requestHelpers';

const { confirm } = Modal;

const RemoveProduct = ({ productId, updated_at, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteItemById(`https://dx.hoangphucthanh.vn:3000/maintenance/products/${productId}/${updated_at}`);
      message.success('Xóa hàng hóa thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      message.error(`Không thể xóa hàng hóa: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Xác nhận xóa hàng hóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa hàng hóa "${productId}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: handleDelete,
      onCancel,
    });
  };

  useEffect(() => {
    if (productId && updated_at) {
      showDeleteConfirm();
    }
  }, [productId, updated_at]);

  return null;
};

export default RemoveProduct;
