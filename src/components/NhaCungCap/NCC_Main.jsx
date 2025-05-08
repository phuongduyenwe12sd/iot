import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';

// Thao tác chung
import '../utils/css/Custom-Table.css';
import '../utils/css/Custom-Button.css';
import '../utils/css/Custom-Filter.css';
import { fetchData } from '../utils/api/apiHandler';
import PaginationControl from '../utils/format/PaginationControl';
import { handleGenericImport } from '../utils/data/dataHandler';
import { resetFilters } from '../utils/data/resetFilter';
import AreaHeader from '../utils/jsx/AreaHeader';

// Các tính năng
import './NCC_Main.css';
import NhaCungCap_Import from './Function/NCC_Import';
import NhaCungCap_Export from './Function/NCC_Export';
import NhaCungCapFilter from './Function/NCC_Filter';
import { filterNhaCungCap } from "./Function/NCC_FilterLogic";
import NhaCungCapTableView from './View/NCC_TableView';
import EditSupplier from './Function/NCC_Update';
import AddSupplier from './Function/NCC_Add';
import RemoveSupplier from './Function/NCC_Delete';

const BangNhaCungCap = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Các state bộ lọc, phân trang
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [addSupplier, setAddSupplier] = useState(false);
    const [deletingSupplier, setDeletingSupplier] = useState(null);

    const fetchSuppliers = () => {
        fetchData({
            endpoint: '/suppliers',
            setData,
            setLoading,
        });
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleImport = (importedData) => {
        const dataWithSTT = handleGenericImport(data, importedData);
        setData([...data, ...dataWithSTT]);
        message.success('Import thành công!');
    };

    const handleEdit = (record) => {
        setEditingSupplier(record.ma_nha_cung_cap);
    };

    const handleEditClose = () => {
        setEditingSupplier(null);
        fetchSuppliers();
    };

    const handleAddSuccess = () => {
        setAddSupplier(false);
        fetchSuppliers();
    };

    const handleRemove = (record) => {
        setDeletingSupplier(record);
    };    

    const handleRefresh = () => {
        setSearchTerm('');
        resetFilters([setStatusFilter, setCountryFilter]);
        setCurrentPage(1);
        fetchSuppliers();
    };

    const filteredData = filterNhaCungCap(data, {
        searchTerm,
        statusFilter,
        countryFilter,
    });

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-nha-cung-cap-container">
            <AreaHeader
                title="Nhà cung cấp"
                onImportClick={() => setShowImportModal(true)} // Mở modal import
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddSupplier(true)}
            />

            <NhaCungCap_Import
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchSuppliers(); // Gọi lại API để cập nhật danh sách sau khi import
                }}
            />

            <NhaCungCap_Export
                data={data}
                filteredData={filteredData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            {/* Lọc dữ liệu*/}
            <NhaCungCapFilter
                data={data}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                countryFilter={countryFilter}
                setCountryFilter={setCountryFilter}
                onRefresh={handleRefresh}
                loading={loading}
            />

            {/* Bảng dữ liệu */}
            <NhaCungCapTableView
                data={filteredData}
                currentPage={currentPage}
                pageSize={pageSize}
                loading={loading}
                handleEdit={handleEdit}
                handleRemove={handleRemove}
            />

            {/* Chuyển trang và phân trang */}
            <PaginationControl
                total={filteredData.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onSizeChange={handlePageChange}
            />

            {/* Modal sửa */}
            <Modal
                open={!!editingSupplier}
                onCancel={() => setEditingSupplier(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditSupplier
                    supplierId={editingSupplier}
                    onCancel={() => setEditingSupplier(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            {/* Modal thêm */}
            <Modal
                open={addSupplier}
                onCancel={() => setAddSupplier(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddSupplier
                    visible={addSupplier}
                    onCancel={() => setAddSupplier(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {/* Xóa */}
            {deletingSupplier && (
                <RemoveSupplier
                    supplierId={deletingSupplier.ma_nha_cung_cap}
                    supplierName={deletingSupplier.ten_nha_cung_cap}
                    onSuccess={() => {
                        setDeletingSupplier(null);
                        fetchSuppliers();
                    }}
                    onCancel={() => setDeletingSupplier(null)}
                />
            )}
        </div>
    );
};

export default BangNhaCungCap;
