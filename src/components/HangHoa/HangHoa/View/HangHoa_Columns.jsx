import { Button, Space, Tag } from 'antd';
import { formatDate } from '../../../utils/format/formatDate';
import { getCountryName } from '../../../utils/transform/countryCodes';

export const getHangHoaColumns = (handleEdit, handleRemove) => [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "3%" },
    { title: 'Mã hàng', dataIndex: 'ma_hang', key: 'ma_hang', width: "5%" },
    { title: 'Tên hàng', dataIndex: 'ten_hang', key: 'ten_hang', width: "15%" },
    { title: 'Loại hàng', dataIndex: ['product_type', 'ten_loai_hang'], key: 'ten_loai_hang', width: "9%" },
    { title: 'Tình trạng', dataIndex: 'tinh_trang_hang_hoa', key: 'tinh_trang_hang_hoa', width: "5%", 
        render: (status) => {
            let color = '';
            switch (status) {
                case 'Đang kinh doanh':
                    color = 'blue';
                    break;
                case 'Ngừng kinh doanh':
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
    { title: 'Nhà cung cấp', dataIndex: ['suppliers', 'ten_nha_cung_cap'], key: 'ten_nha_cung_cap', width: "6%" },
    { title: 'Nước xuất xứ', dataIndex: 'nuoc_xuat_xu', key: 'nuoc_xuat_xu', render: (code) => getCountryName(code), width: "6%" },
    { title: 'Trọng lượng', dataIndex: 'trong_luong_tinh', key: 'trong_luong_tinh', render: (value) => value?.toLocaleString('vi-VN'), width: "5%" },
    { title: 'Giá thực', dataIndex: 'gia_thuc', key: 'gia_thuc', render: (value) => value?.toLocaleString('vi-VN'), width: "5%" },
    { title: 'Đơn vị', dataIndex: 'don_vi_ban_hang', key: 'don_vi_ban_hang', width: "4%" },
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
    { title: 'Người cập nhật', dataIndex: ['accounts', 'ho_va_ten'], key: 'nguoi_cap_nhat', width: "9%" },
    { title: 'Ngày cập nhật', dataIndex: 'ngay_cap_nhat', key: 'ngay_cap_nhat', render: (text) => formatDate(text), width: "5%"},
    { title: 'Mô tả', dataIndex: 'mo_ta', key: 'mo_ta', width: "18%" },
];
