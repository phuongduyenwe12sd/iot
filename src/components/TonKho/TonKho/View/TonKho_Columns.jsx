import { Button, Space } from 'antd';

export const getTonKhoColumns = (handleEdit) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "5%" },
    { title: 'Mã hàng', dataIndex: 'ma_hang', key: 'ma_hang', width: "10%" },
    { title: 'Kho', dataIndex: ['warehouse', 'ten_kho'], key: 'ten_kho', width: "12%"},
    { title: 'Tồn trước đó', dataIndex: 'ton_truoc_do', key: 'ton_truoc_do', width: "12%" },
    { title: 'Tổng nhập', dataIndex: 'tong_nhap', key: 'tong_nhap', width: "12%" },
    { title: 'Tổng xuất', dataIndex: 'tong_xuat', key: 'tong_xuat', width: "12%" },
    { title: 'Tồn hiện tại', dataIndex: 'ton_hien_tai', key: 'ton_hien_tai', width: "12%" },
    { title: 'Mức tồn tối thiểu', dataIndex: 'muc_ton_toi_thieu', key: 'muc_ton_toi_thieu', width: "17%" },
    {
        title: 'Hành động',
        key: 'hanh_dong',
        render: (_, record) => (
            <Space>
                <Button type="primary" size="small" onClick={() => handleEdit(record)}>Sửa</Button>
            </Space>
        ),
        width: "8%",
    },
];
