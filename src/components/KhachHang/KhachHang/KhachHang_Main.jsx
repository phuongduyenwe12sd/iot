// Thư viện React và Ant Design
import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';

//Thao tác chung
// Các file CSS dùng chung để chuẩn hóa giao diện bảng, nút, filter
import '../../utils/css/Custom-Table.css';
import '../../utils/css/Custom-Button.css';
import '../../utils/css/Custom-Filter.css';
// Hàm gọi API
import { fetchData } from '../../utils/api/apiHandler';
// Component phân trang
import PaginationControl from '../../utils/format/PaginationControl';
// Hàm xử lý Import / Export
import { handleGenericImport } from '../../utils/data/dataHandler';
// Hàm reset các bộ lọc
import { resetFilters } from '../../utils/data/resetFilter';
// Header của mỗi bảng dữ liệu
import AreaHeader from '../../utils/jsx/AreaHeader';

// Các tính năng
import './KhachHang_Main.css';
import KhachHang_Import from './Function/KhachHang_Import';
import KhachHang_Export from './Function/KhachHang_Export';
import KhachHangFilter from './Function/KhachHang_Filter';
import { filterKhachHang } from "./Function/KhachHang_FilterLogic";
import KhachHangTableView from './View/KhachHang_TableView';
import EditCustomer from './Function/KhachHang_Update';
import AddCustomer from './Function/KhachHang_Add';
import RemoveCustomer from './Function/KhachHang_Delete';

const BangKhachHang = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // State các bộ lọc và phân trang
    const [showExportModal, setShowExportModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('all');
    const [accountFilter, setAccountFilter] = useState('all');
    const [provinceFilter, setProvinceFilter] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [addCustomer, setAddCustomer] = useState(false);
    const [deletingCustomer, setDeletingCustomer] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchCustomers = () => {
        fetchData({
            endpoint: '/customers', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleImport = (importedData) => {
        // Dùng hàm tái sử dụng để tự sinh STT và nối vào data cũ
        const dataWithSTT = handleGenericImport(data, importedData);
        setData([...data, ...dataWithSTT]);
        message.success('Import thành công!');
    };

    const handleEdit = (record) => {
        setEditingCustomer(record.ma_khach_hang);
    };

    const handleEditClose = () => {
        setEditingCustomer(null);
        fetchCustomers();
    };

    const handleAddSuccess = () => {
        setAddCustomer(false);
        fetchCustomers();
    };

    const handleRemove = (record) => {
        setDeletingCustomer(record);
    };   

    const handleRefresh = () => {
        setSearchTerm('');
        resetFilters([setYearFilter, setAccountFilter, setProvinceFilter]);
        setCurrentPage(1);
        fetchCustomers();
    };

    const filteredData = filterKhachHang(data, {
        searchTerm,
        yearFilter,
        accountFilter,
        provinceFilter,
    });

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-khach-hang-container">
            <AreaHeader
                title="Danh mục khách hàng"
                onImportClick={() => document.getElementById('import-excel').click()}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddCustomer(true)} 
                ImportComponent={<KhachHang_Import onImport={handleImport} />}
            />

            <KhachHang_Export
                data={data}
                filteredData={filteredData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <KhachHangFilter
                data={data}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                accountFilter={accountFilter}
                setAccountFilter={setAccountFilter}
                provinceFilter={provinceFilter}
                setProvinceFilter={setProvinceFilter}
                onRefresh={handleRefresh}
                loading={loading}
            />

            <KhachHangTableView
                data={filteredData}
                currentPage={currentPage}
                pageSize={pageSize}
                loading={loading}
                handleEdit={handleEdit}
                handleRemove={handleRemove}
            />

            <PaginationControl
                total={filteredData.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onSizeChange={handlePageChange}
            />

            <Modal
                open={!!editingCustomer}
                onCancel={() => setEditingCustomer(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditCustomer
                    customerId={editingCustomer}
                    onCancel={() => setEditingCustomer(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                open={addCustomer}
                onCancel={() => setAddCustomer(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddCustomer
                    visible={addCustomer}
                    onCancel={() => setAddCustomer(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingCustomer && (
                <RemoveCustomer
                    customerId={deletingCustomer.ma_khach_hang}
                    customerName={deletingCustomer.ten_khach_hang}
                    onSuccess={() => {
                        setDeletingCustomer(null);
                        fetchCustomers();
                    }}
                    onCancel={() => setDeletingCustomer(null)}
                />
            )}
        </div>
    );
};

export default BangKhachHang;