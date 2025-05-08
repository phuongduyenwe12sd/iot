import React, { useEffect, useState } from 'react';
import { Modal, Select, Button, message } from 'antd';
import dayjs from 'dayjs';
import { fetchDataList, createItem, deleteItemById } from '../../../utils/api/requestHelpers';

const { Option } = Select;

const TonKho_UpdateAuto = ({ visible, onClose, onRefresh }) => {
    const [yearOptions, setYearOptions] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const stockInData = await fetchDataList('https://dx.hoangphucthanh.vn:3000/maintenance/stock-in');
                const years = [...new Set(stockInData.map(item => dayjs(item.ngay_nhap_hang).year()))];
                setYearOptions(years.sort((a, b) => b - a));
            } catch (error) {
                message.error('Không thể lấy danh sách năm.');
            }
        };
        if (visible) fetchYears();
    }, [visible]);

    const handleUpdateInventory = async () => {
        if (!selectedYear) return message.warning('Vui lòng chọn năm');
        setLoading(true);
        try {
            // Bước 1: Lấy dữ liệu stock-in, stock-out và inventory
            const [stockInData, stockOutData, inventoryData] = await Promise.all([
                fetchDataList('https://dx.hoangphucthanh.vn:3000/maintenance/stock-in'),
                fetchDataList('https://dx.hoangphucthanh.vn:3000/maintenance/stock-out'),
                fetchDataList('https://dx.hoangphucthanh.vn:3000/maintenance/inventory'),
            ]);
    
            // Bước 2: Xoá các bản ghi inventory theo năm đã chọn (nếu có)
            const inventoryToDelete = inventoryData.filter(item => item.nam === selectedYear);
            if (inventoryToDelete.length > 0) {
                await Promise.all(
                    inventoryToDelete.map(item =>
                        deleteItemById(`https://dx.hoangphucthanh.vn:3000/maintenance/inventory/${item.ma_inventory}`)
                    )
                );
                console.log(`Đã xóa ${inventoryToDelete.length} bản ghi tồn kho của năm ${selectedYear}.`);
            } else {
                console.log(`Không có bản ghi nào để xóa trong năm ${selectedYear}.`);
            }
    
            // Bước 3: Lọc danh sách mã hàng duy nhất theo năm từ stock-in
            const filteredStockIn = stockInData.filter(item =>
                dayjs(item.ngay_nhap_hang).year() === selectedYear
            );
    
            const uniqueProducts = {};
            filteredStockIn.forEach(item => {
                if (!uniqueProducts[item.ma_hang]) {
                    uniqueProducts[item.ma_hang] = {
                        ma_hang: item.ma_hang,
                        ten_kho: item.ten_kho,
                        tong_nhap: 0,
                        tong_xuat: 0
                    };
                }
                uniqueProducts[item.ma_hang].tong_nhap += item.so_luong_nhap;
            });
    
            // Bước 4: Tính tổng xuất từ stock-out
            stockOutData
                .filter(item => dayjs(item.ngay_xuat_hang).year() === selectedYear)
                .forEach(item => {
                    if (uniqueProducts[item.ma_hang]) {
                        uniqueProducts[item.ma_hang].tong_xuat += item.so_luong_xuat;
                    }
                });
    
            // Bước 5: Tạo bản ghi mới trong inventory
            let stt = 1;
            for (const ma_hang in uniqueProducts) {
                const product = uniqueProducts[ma_hang];
                const newItem = {
                    nam: selectedYear,
                    stt: stt,
                    ma_inventory: `TK${selectedYear}${String(stt)}`,
                    ma_hang: ma_hang,
                    ten_kho: product.ten_kho,
                    ton_truoc_do: 0,
                    tong_nhap: product.tong_nhap,
                    tong_xuat: product.tong_xuat,
                    ton_hien_tai: product.tong_nhap - product.tong_xuat,
                    muc_ton_toi_thieu: 2
                };
    
                // Log dữ liệu trước khi gửi
                console.log('Dữ liệu gửi đến API createItem:', newItem);
    
                try {
                    await createItem('https://dx.hoangphucthanh.vn:3000/maintenance/inventory', newItem);
                } catch (error) {
                    console.error('Lỗi khi thêm mới bản ghi:', error.response?.data || error.message);
                    throw new Error(`Lỗi thêm mới: ${error.response?.data?.message || error.message}`);
                }
    
                stt++;
            }
    
            message.success('Cập nhật tồn kho thành công!');
            onClose();
            onRefresh();
        } catch (error) {
            console.error('Lỗi khi cập nhật tồn kho:', error);
            message.error(`Lỗi cập nhật tồn kho: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={visible}
            title="Lấy dữ liệu tồn kho theo năm"
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <div style={{ marginBottom: 16 }}>
                <label>Chọn năm cần cập nhật tồn kho:</label>
                <Select
                    style={{ width: '100%', marginTop: 8 }}
                    placeholder="Chọn năm"
                    value={selectedYear}
                    onChange={value => setSelectedYear(value)}
                >
                    {yearOptions.map(year => (
                        <Option key={year} value={year}>
                            {year}
                        </Option>
                    ))}
                </Select>
            </div>
            <Button type="primary" loading={loading} onClick={handleUpdateInventory}>
                Bắt đầu lấy dữ liệu
            </Button>
        </Modal>
    );
};

export default TonKho_UpdateAuto;
