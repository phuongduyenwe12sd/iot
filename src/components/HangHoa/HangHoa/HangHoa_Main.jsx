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
import './HangHoa_Main.css';
import HangHoa_Import from './Function/HangHoa_Import';
import HangHoa_Export from './Function/HangHoa_Export';
import HangHoaFilter from './Function/HangHoa_Filter';
import { filterHangHoa } from "./Function/HangHoa_FilterLogic";
import HangHoaTableView from './View/HangHoa_TableView';
import EditProduct from './Function/HangHoa_Update';
import AddProduct from './Function/HangHoa_Add';
import RemoveProduct from './Function/HangHoa_Delete';

const BangHangHoa = () => {
    // State lưu dữ liệu bảng và trạng thái chung
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // State các bộ lọc và phân trang
    const [showExportModal, setShowExportModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingProduct, setEditingProduct] = useState(null);
    const [addProduct, setAddProduct] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState(null);

    // Gọi API lấy danh sách khách hàng bằng hàm tái sử dụng
    const fetchProducts = () => {
        fetchData({
            endpoint: '/products', // endpoint API
            setData,                // set state dữ liệu
            setLoading,             // set trạng thái loading
        });
    };

    // Tự động gọi API khi component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    const handleImport = (importedData) => {
        // Dùng hàm tái sử dụng để tự sinh STT và nối vào data cũ
        const dataWithSTT = handleGenericImport(data, importedData);
        setData([...data, ...dataWithSTT]);
        message.success('Import thành công!');
    };

    const handleEdit = (record) => {
        setEditingProduct({ ma_hang: record.ma_hang, update_at: record.update_at });
    };

    const handleEditClose = () => {
        setEditingProduct(null);
        fetchProducts();
    };

    const handleAddSuccess = () => {
        setAddProduct(false);
        fetchProducts();
    };

    const handleRemove = (record) => {
        setDeletingProduct({
            ma_hang: record.ma_hang,
            ten_hang: record.ten_hang,
            ngay_cap_nhat: record.ngay_cap_nhat, // Đảm bảo trường này được gán
        });
    };

    const handleRefresh = () => {
        setSearchTerm('');
        resetFilters([setStatusFilter, setCountryFilter, setSupplierFilter]);
        setCurrentPage(1);
        fetchProducts();
    };

    const filteredData = filterHangHoa(data, {
        searchTerm,
        statusFilter,
        countryFilter,
        supplierFilter,
    });

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div className="bang-hang-hoa-container">
            <AreaHeader
                title="Danh mục Hàng hóa"
                onImportClick={() => document.getElementById('import-excel').click()}
                onExportClick={() => setShowExportModal(true)}
                onAddClick={() => setAddProduct(true)} 
                ImportComponent={<HangHoa_Import onImport={handleImport} />}
            />

            <HangHoa_Export
                data={data}
                filteredData={filteredData}
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            <HangHoaFilter
                data={data}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                countryFilter={countryFilter}
                setCountryFilter={setCountryFilter}
                supplierFilter={supplierFilter}
                setSupplierFilter={setSupplierFilter}
                onRefresh={handleRefresh}
                loading={loading}
            />

            <HangHoaTableView
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
            open={!!editingProduct}
            onCancel={() => setEditingProduct(null)}
            footer={null}
            width={1000}
            destroyOnClose
            >
            {editingProduct && (
                <EditProduct
                    productId={editingProduct.ma_hang}
                    updateAt={editingProduct.update_at} // Truyền thêm update_at
                    onCancel={() => setEditingProduct(null)}
                    onSuccess={handleEditClose}
                />
            )}
            </Modal>

            <Modal
                open={addProduct}
                onCancel={() => setAddProduct(false)}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <AddProduct
                    visible={addProduct}
                    onCancel={() => setAddProduct(false)}
                    onSuccess={handleAddSuccess}
                />
            </Modal>

            {deletingProduct && (
                <RemoveProduct
                    productId={deletingProduct.ma_hang}
                    productName={deletingProduct.ten_hang}
                    updatedAt={deletingProduct.ngay_cap_nhat} // Đổi từ updated_at thành updatedAt
                    onSuccess={() => {
                        setDeletingProduct(null);
                        fetchProducts();
                    }}
                    onCancel={() => setDeletingProduct(null)}
                />
            )}
        </div>
    );
};

export default BangHangHoa;