import React from 'react';
import { Table, message } from 'antd';
import { getNhaCungCapColumns } from './NCC_Columns';
import '../NCC_Main.css';

const NhaCungCapTableView = ({
    data,
    currentPage,
    pageSize,
    loading,
    handleEdit,
    handleRemove,
    hasEditPermission // Accept permission state from parent instead of checking again
}) => {
    // Remove local permission state and check - use the prop from parent instead
    
    // Custom wrapper for handleEdit that checks permissions first
    const authorizedEdit = (record) => {
        if (!hasEditPermission) {
            message.error('Bạn không có quyền chỉnh sửa. Chỉ tài khoản TNphuong mới có quyền này.');
            return;
        }
        handleEdit(record);
    };
    
    // Custom wrapper for handleRemove that checks permissions first
    const authorizedRemove = (record) => {
        if (!hasEditPermission) {
            message.error('Bạn không có quyền xóa. Chỉ tài khoản TNphuong mới có quyền này.');
            return;
        }
        handleRemove(record);
    };

    // Get columns with our authorized handlers
    const columns = getNhaCungCapColumns(authorizedEdit, authorizedRemove, hasEditPermission);

    return (
        <div className="bang-nha-cung-cap-scroll-wrapper">
            <div style={{ width: 1800 }}>
                <Table
                    columns={columns}
                    dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    rowKey="ma_nha_cung_cap"
                    bordered
                    size="small"
                    pagination={false}
                    className="custom-ant-table"
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default NhaCungCapTableView;