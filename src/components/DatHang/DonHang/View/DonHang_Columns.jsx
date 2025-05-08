import { Button, Space } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getDonHangColumns = (handleEdit, handleRemove) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "5%" },
    { title: 'Số đơn hàng', dataIndex: 'so_don_hang', key: 'so_don_hang', width: "10%" },
    { title: 'Tổng giá trị đơn hàng', dataIndex: 'tong_gia_tri_don_hang', key: 'tong_gia_tri_don_hang', render: (value) => value?.toLocaleString('vi-VN'), width: "20%" },
    { title: 'Người lập đơn', dataIndex: ['accounts', 'ho_va_ten'], key: 'nguoi_lap_don', width: "8%" },
    {
        title: 'Ngày tạo đơn',
        dataIndex: 'ngay_tao_don',
        key: 'ngay_tao_don',
        render: (text) => formatDate(text),
        width: "8%",
    },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "41%" },
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
