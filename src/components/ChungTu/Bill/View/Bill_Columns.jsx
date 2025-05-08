import { Button, Space } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getBillColumns = (handleEdit, handleRemove) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "5%" },
    { title: 'Mã bill', dataIndex: 'ma_bill', key: 'ma_bill', width: "8%" },
    { title: 'Người cập nhật', dataIndex: ['accounts', 'ho_va_ten'], key: 'nguoi_cap_nhat', width: "8%" },
    {
        title: 'Ngày cập nhật',
        dataIndex: 'ngay_cap_nhat',
        key: 'ngay_cap_nhat',
        render: (text) => formatDate(text),
        width: "8%",
    },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "63%" },
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
