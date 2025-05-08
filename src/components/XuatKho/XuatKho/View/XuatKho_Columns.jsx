import { Button, Space } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getXuatKhoColumns = (handleEdit, handleRemove) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "5%" },
    { title: 'Mã hàng', dataIndex: 'ma_hang', key: 'ma_hang', width: "8%" },
    { title: 'Ngày xuất', dataIndex: 'ngay_xuat_hang', key: 'ngay_xuat_hang', render: (text) => formatDate(text), width: "8%"},
    { title: 'Số lượng', dataIndex: 'so_luong_xuat', key: 'so_luong_xuat', width: "8%" },
    { title: 'Người phụ trách', dataIndex: ['accounts', 'ho_va_ten'], key: 'nguoi_phu_trach', width: "15%" },
    { title: 'Kho', dataIndex: ['warehouse', 'ten_kho'], key: 'ten_kho', width: "15%" },
    { title: 'Khách hàng', dataIndex: ['customers', 'ten_khach_hang'], key: 'ten_khach_hang', width: "33%" },
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
