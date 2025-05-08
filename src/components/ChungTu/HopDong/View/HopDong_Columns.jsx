import { Button, Space, Tag } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';

export const getHopDongColumns = (handleEdit, handleRemove) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "3%" },
    { title: 'Số hợp đồng', dataIndex: 'so_hop_dong', key: 'so_hop_dong', width: "5%" },
    { title: 'Loại hợp đồng', dataIndex: ['contract_type', 'ten_loai_hop_dong'], key: 'loai_hop_dong', width: "10%" },
    { title: 'Trạng thái', dataIndex: 'trang_thai_hop_dong', key: 'trang_thai_hop_dong', width: "5%", 
        render: (status) => {
            let color = '';
            switch (status) {
                case 'Đang thực hiện':
                    color = 'orange';
                    break;
                case 'Còn hiệu lực':
                    color = 'blue';
                    break;
                case 'Hết hạn':
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
    {
        title: 'Ngày ký hợp đồng',
        dataIndex: 'ngay_ky_hop_dong',
        key: 'ngay_ky_hop_dong',
        render: (text) => formatDate(text),
        width: "5%",
    },
    {
        title: 'Ngày bắt đầu',
        dataIndex: 'ngay_bat_dau',
        key: 'ngay_bat_dau',
        render: (text) => formatDate(text),
        width: "5%",
    },
    {
        title: 'Ngày kết thúc',
        dataIndex: 'ngay_ket_thuc',
        key: 'ngay_ket_thuc',
        render: (text) => formatDate(text),
        width: "5%",
    },
    { title: 'Giá trị hợp đồng', dataIndex: 'gia_tri_hop_dong', key: 'gia_tri_hop_dong', render: (value) => value?.toLocaleString('vi-VN'), width: "7%" },
    { title: 'Đối tác liên quan', dataIndex: 'doi_tac_lien_quan', key: 'doi_tac_lien_quan', width: "15%" },
    { title: 'Điều khoản thanh toán', dataIndex: 'dieu_khoan_thanh_toan', key: 'dieu_khoan_thanh_toan', width: "10%" },
    {
        title: 'Hành động',
        key: 'hanh_dong',
        render: (_, record) => (
            <Space>
                <Button type="primary" size="small" onClick={() => handleEdit(record)}>Sửa</Button>
                <Button type="primary" danger size="small" onClick={() => handleRemove(record)}>Xóa</Button>
            </Space>
        ),
        width: "5%",
    },
    { title: 'Tệp đính kèm', dataIndex: 'tep_dinh_kem', key: 'tep_dinh_kem', width: "5%" }, 
    { title: 'Vị trí lưu', dataIndex: 'vi_tri_luu_tru', key: 'vi_tri_luu_tru', width: "8%" },
    { title: 'Người tạo', dataIndex: ['accounts', 'ho_va_ten'], key: 'nguoi_tao', width: "5%" },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "7%" },
];
