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
// Header của mỗi bảng dữ liệu
import AreaHeader from '../../utils/jsx/AreaHeader';

// Các tính năng
import './Bill_Main.css';
import Bill_Import from './Function/Bill_Import';
import Bill_Export from './Function/Bill_Export';
import BillTableView from './View/Bill_TableView';
import EditBill from './Function/Bill_Update';
import AddBill from './Function/Bill_Add';
import RemoveBill from './Function/Bill_Delete';

const BangBill = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // State phân trang
    const [showExportModal, setShowExportModal] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingBill, setEditingBill] = useState(null);
    const [addBill, setAddBill] = useState(false);
    const [deletingBill, setDeletingBill] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchBills = () => {
        fetchData({
            endpoint: '/bills', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchBills();
    }, []);

    const handleImport = (importedData) => {
        // Dùng hàm tái sử dụng để tự sinh STT và nối vào data cũ
        const dataWithSTT = handleGenericImport(data, importedData);
        setData([...data, ...dataWithSTT]);
        message.success('Import thành công!');
    };

    const handleEdit = (record) => {
        setEditingBill(record.ma_bill);
    };

    const handleEditClose = () => {
        setEditingBill(null);
        fetchBills();
    };

    const handleAddSuccess = () => {
        setAddBill(false);
        fetchBills();
    };

    const handleRemove = (record) => {
        setDeletingBill(record);
    };

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-bill-container">
            <AreaHeader
                title="Bill"
                onImportClick={() => document.getElementById('import-excel').click()}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddBill(true)}
                ImportComponent={<Bill_Import onImport={handleImport} />}
            />

            <Bill_Export
                data={data}
                filteredData={data}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <BillTableView
                data={data}
                currentPage={currentPage}
                pageSize={pageSize}
                loading={loading}
                handleEdit={handleEdit}
                handleRemove={handleRemove}
            />

            <PaginationControl
                total={data.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onSizeChange={handlePageChange}
            />

            <Modal
                open={!!editingBill}
                onCancel={() => setEditingBill(null)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <EditBill
                    billId={editingBill}
                    onCancel={() => setEditingBill(null)}
                    onSuccess={handleEditClose}
                />
            </Modal>

            <Modal
                open={addBill}
                onCancel={() => setAddBill(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddBill
                    visible={addBill}
                    onCancel={() => setAddBill(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingBill && (
                <RemoveBill
                    billId={deletingBill.ma_bill}
                    onSuccess={() => {
                        setDeletingBill(null);
                        fetchBills();
                    }}
                    onCancel={() => setDeletingBill(null)}
                />
            )}
        </div>
    );
};

export default BangBill;