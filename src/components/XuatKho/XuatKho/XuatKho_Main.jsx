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
import './XuatKho_Main.css';
import XuatKho_Import from './Function/XuatKho_Import';
import XuatKho_Export from './Function/XuatKho_Export';
import XuatKhoFilter from './Function/XuatKho_Filter';
import { filterXuatKho } from "./Function/XuatKho_FilterLogic";
import XuatKhoTableView from './View/XuatKho_TableView';
import EditStock_Out from './Function/XuatKho_Update';
import AddStockOut from './Function/XuatKho_Add';
import RemoveStockOut from './Function/XuatKho_Delete';

const BangXuatKho = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // State các bộ lọc và phân trang
    const [showExportModal, setShowExportModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [accountFilter, setAccountFilter] = useState('all');
    const [warehouseFilter, setWarehouseFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingStock_Out, setEditingStock_Out] = useState(null);
    const [addStockOut, setAddStockOut] = useState(false);
    const [deletingStockOut, setDeletingStockOut] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchStock_Out = () => {
        fetchData({
            endpoint: '/stock-out', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchStock_Out();
    }, []);

    const handleImport = (importedData) => {
        // Dùng hàm tái sử dụng để tự sinh STT và nối vào data cũ
        const dataWithSTT = handleGenericImport(data, importedData);
        setData([...data, ...dataWithSTT]);
        message.success('Import thành công!');
    };

    const handleEdit = (record) => {
        setEditingStock_Out(record.ma_stock_out);
    };

    const handleEditClose = () => {
        setEditingStock_Out(null);
        fetchStock_Out();
    };

    const handleAddSuccess = () => {
        setAddStockOut(false);
        fetchStock_Out();
    };

    const handleRemove = (record) => {
        setDeletingStockOut(record);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        resetFilters([setAccountFilter, setWarehouseFilter, setYearFilter]);
        setCurrentPage(1);
        fetchStock_Out();
    };

    const filteredData = filterXuatKho(data, {
        searchTerm,
        accountFilter,
        warehouseFilter,
        yearFilter,
    });

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-xuat-kho-container">
            <AreaHeader
                title="Xuất Hàng"
                onImportClick={() => document.getElementById('import-excel').click()}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddStockOut(true)}
                ImportComponent={<XuatKho_Import onImport={handleImport} />}
            />

            <XuatKho_Export
                data={data}
                filteredData={filteredData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <XuatKhoFilter
                data={data}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                accountFilter={accountFilter}
                setAccountFilter={setAccountFilter}
                warehouseFilter={warehouseFilter}
                setWarehouseFilter={setWarehouseFilter}
                onRefresh={handleRefresh}
                loading={loading}
            />

            <XuatKhoTableView
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
                open={!!editingStock_Out}
                onCancel={() => setEditingStock_Out(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditStock_Out
                    stock_outId={editingStock_Out}
                    onCancel={() => setEditingStock_Out(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                open={addStockOut}
                onCancel={() => setAddStockOut(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddStockOut
                    visible={addStockOut}
                    onCancel={() => setAddStockOut(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingStockOut && (
                <RemoveStockOut
                    stock_outId={deletingStockOut.ma_stock_out}
                    stock_out={deletingStockOut.ma_stock_out}
                    onSuccess={() => {
                        setDeletingStockOut(null);
                        fetchStock_Out();
                    }}
                    onCancel={() => setDeletingStockOut(null)}
                />
            )}
        </div>
    );
};

export default BangXuatKho;