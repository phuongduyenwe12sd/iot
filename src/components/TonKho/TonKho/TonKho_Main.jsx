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
import './TonKho_Main.css';
import NhapKho_Import from './Function/TonKho_Import';
import TonKho_Export from './Function/TonKho_Export';
import TonKhoFilter from './Function/TonKho_Filter';
import { filterTonKho } from "./Function/TonKho_FilterLogic";
import TonKhoTableView from './View/TonKho_TableView';
import EditStock_In from './Function/TonKho_Update';
import TonKho_UpdateAuto from './Function/TonKho_UpdateAuto';

const BangTonKho = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // State các bộ lọc và phân trang
    const [showExportModal, setShowExportModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [product_typeFilter, setProductTypeFilter] = useState('all');
    const [warehouseFilter, setWarehouseFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingStock_In, setEditingStock_In] = useState(null);
    const [showUpdateInventoryModal, setShowUpdateInventoryModal] = useState(false);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchInventory = () => {
        fetchData({
            endpoint: '/inventory', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchInventory();
    }, []);

    const handleImport = (importedData) => {
        // Dùng hàm tái sử dụng để tự sinh STT và nối vào data cũ
        const dataWithSTT = handleGenericImport(data, importedData);
        setData([...data, ...dataWithSTT]);
        message.success('Import thành công!');
    };

    const handleEdit = (record) => {
        setEditingStock_In(record.ma_stock_in);
    };

    const handleEditClose = () => {
        setEditingStock_In(null);
        fetchInventory();
    };

    const handleRefresh = () => {
        setSearchTerm('');
        resetFilters([setProductTypeFilter, setWarehouseFilter, setYearFilter]);
        setCurrentPage(1);
        fetchInventory();
    };

    const filteredData = filterTonKho(data, {
        searchTerm,
        product_typeFilter,
        warehouseFilter,
        yearFilter,
    });

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-ton-kho-container">
            <AreaHeader
                title="Tồn Kho"
                onImportClick={() => document.getElementById('import-excel').click()}
                onExportClick={() => setShowExportModal(true)}
                onReloadClick={() => setShowUpdateInventoryModal(true)} // 👈 thêm dòng này
                hideAddButton={true} // 👈 ẩn "Thêm mới"
            />

            <TonKho_UpdateAuto
                visible={showUpdateInventoryModal}
                onClose={() => setShowUpdateInventoryModal(false)}
                onRefresh={fetchInventory}
            />

            <TonKho_Export
                data={data}
                filteredData={filteredData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <TonKhoFilter
                data={data}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                product_typeFilter={product_typeFilter}
                setProductTypeFilter={setProductTypeFilter}
                warehouseFilter={warehouseFilter}
                setWarehouseFilter={setWarehouseFilter}
                onRefresh={handleRefresh}
                loading={loading}
            />

            <TonKhoTableView
                data={filteredData}
                currentPage={currentPage}
                pageSize={pageSize}
                loading={loading}
                handleEdit={handleEdit}
            />

            <PaginationControl
                total={filteredData.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onSizeChange={handlePageChange}
            />

            <Modal
                open={!!editingStock_In}
                onCancel={() => setEditingStock_In(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditStock_In
                    stock_inId={editingStock_In}
                    onCancel={() => setEditingStock_In(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>
        </div>
    );
};

export default BangTonKho;