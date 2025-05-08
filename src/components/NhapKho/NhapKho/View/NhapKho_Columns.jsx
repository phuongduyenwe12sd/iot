import { Button, Space } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getNhapKhoColumns = (handleEdit, handleRemove) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "5%" },
    { title: 'Mã hàng', dataIndex: 'ma_hang', key: 'ma_hang', width: "8%" },
    { title: 'Ngày nhập', dataIndex: 'ngay_nhap_hang', key: 'ngay_nhap_hang', render: (text) => formatDate(text), width: "8%"},
    { title: 'Số lượng', dataIndex: 'so_luong_nhap', key: 'so_luong_nhap', width: "8%" },
    { title: 'Nhà cung cấp', dataIndex: ['suppliers', 'ten_nha_cung_cap'], key: 'ten_nha_cung_cap', width: "25%" },
    { title: 'Kho', dataIndex: ['warehouse', 'ten_kho'], key: 'ten_kho', width: "15%" },
    { title: 'Bill', dataIndex: 'ma_bill', key: 'ma_bill', width: "8%" },
    { title: 'Hợp Đồng', dataIndex: 'ma_hop_dong', key: 'ma_hop_dong', width: "8%" },
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
