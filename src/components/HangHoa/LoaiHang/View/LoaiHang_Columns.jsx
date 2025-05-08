import { Button, Space, Tag } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getLoaiHangColumns = (handleEdit, handleRemove) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "5%" },
    { title: 'Mã loại hàng', dataIndex: 'ma_loai_hang', key: 'ma_loai_hang', width: "8%" },
    { title: 'Tên loại hàng', dataIndex: 'ten_loai_hang', key: 'ten_loai_hang', width: "20%" },
    { title: 'Trạng thái', dataIndex: 'trang_thai', key: 'trang_thai', width: "8%",
        render: (status) => {
            let color = '';
            switch (status) {
                case 'Hoạt động':
                    color = 'blue';
                    break;
                case 'Dừng':
                    color = 'red';
                    break;
                default:
                    color = 'gray';
            }
            return (
                <Tag 
                    color={color} 
                    style={{ 
                        fontSize: '10px',
                        borderRadius: '6px', 
                        padding: '2px 4px', 
                        fontWeight: 'bold', 
                        display: 'inline-block', 
                        textAlign: 'center', // Căn giữa chữ trong Tag
                        width: '100%' // Đảm bảo Tag chiếm toàn bộ chiều rộng của ô
                    }}
                >
                    {status || 'N/A'}
                </Tag>
            );
        }
    },
    { title: 'Người cập nhật', dataIndex: ['accounts', 'ho_va_ten'], key: 'nguoi_cap_nhat', width: "8%" },
    {
        title: 'Ngày cập nhật',
        dataIndex: 'ngay_cap_nhat',
        key: 'ngay_cap_nhat',
        render: (text) => formatDate(text),
        width: "8%",
    },
    { title: 'Mô tả', dataIndex: 'mo_ta', key: 'mo_ta', width: "35%" },
    {
        title: 'Hành động',
        key: 'hanh_dong',
        render: (_, record) => (
            <Space>
                <Button type="primary" size="small" onClick={() => handleEdit(record)}>Sửa</Button>
                <Button type="primary" danger size="small" onClick={() => handleRemove(record)}>Xóa</Button>
            </Space>
        ),
        width: "8%",
    },
];
