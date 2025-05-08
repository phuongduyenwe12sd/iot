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
import './HopDong_Main.css';
import HopDong_Import from './Function/HopDong_Import';
import HopDong_Export from './Function/HopDong_Export';
import HopDongFilter from './Function/HopDong_Filter';
import { filterHopDong } from "./Function/HopDong_FilterLogic";
import HopDongTableView from './View/HopDong_TableView';
import EditContract from './Function/HopDong_Update';
import AddContract from './Function/HopDong_Add';
import RemoveContract from './Function/HopDong_Delete';

const BangHopDong = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State các bộ lọc và phân trang
    const [showExportModal, setShowExportModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('all');
    const [contract_typeFilter, setContract_TypeFilter] = useState('all');
    const [accountFilter, setAccountFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingContract, setEditingContract] = useState(null);
    const [addContract, setAddContract] = useState(false);
    const [deletingContract, setDeletingContract] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchContracts = () => {
        fetchData({
            endpoint: '/contracts', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchContracts();
    }, []);

    const handleImport = (importedData) => {
        // Dùng hàm tái sử dụng để tự sinh STT và nối vào data cũ
        const dataWithSTT = handleGenericImport(data, importedData);
        setData([...data, ...dataWithSTT]);
        message.success('Import thành công!');
    };

    const handleEdit = (record) => {
        setEditingContract(record.so_hop_dong);
    };

    const handleEditClose = () => {
        setEditingContract(null);
        fetchContracts();
    };

    const handleAddSuccess = () => {
        setAddContract(false);
        fetchContracts();
    };

    const handleRemove = (record) => {
        setDeletingContract(record);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        resetFilters([setYearFilter, setAccountFilter, setStatusFilter, setContract_TypeFilter]);
        setCurrentPage(1);
        fetchContracts();
    };

    const filteredData = filterHopDong(data, {
        searchTerm,
        yearFilter,
        contract_typeFilter,
        accountFilter,
        statusFilter,
    });

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-hop-dong-container">
            <AreaHeader
                title="Danh mục hợp đồng"
                onImportClick={() => document.getElementById('import-excel').click()}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddContract(true)} 
                ImportComponent={<HopDong_Import onImport={handleImport} />}
            />

            <HopDong_Export
                data={data}
                filteredData={filteredData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <HopDongFilter
                data={data}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                contract_typeFilter={contract_typeFilter}
                setContract_TypeFilter={setContract_TypeFilter}
                accountFilter={accountFilter}
                setAccountFilter={setAccountFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onRefresh={handleRefresh}
                loading={loading}
            />

            <HopDongTableView
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
                open={!!editingContract}
                onCancel={() => setEditingContract(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditContract
                    contractId={editingContract}
                    onCancel={() => setEditingContract(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                open={addContract}
                onCancel={() => setAddContract(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddContract
                    visible={addContract}
                    onCancel={() => setAddContract(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingContract && (
                <RemoveContract
                    contractId={deletingContract.so_hop_dong}
                    contractName={deletingContract.so_hop_dong}
                    onSuccess={() => {
                        setDeletingContract(null);
                        fetchContracts();
                    }}
                    onCancel={() => setDeletingContract(null)}
                />
            )}
        </div>
    );
};

export default BangHopDong;