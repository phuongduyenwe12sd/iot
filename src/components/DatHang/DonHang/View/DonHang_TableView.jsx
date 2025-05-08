import React from 'react';
import { Table } from 'antd';
import { getDonHangColumns } from './DonHang_Columns';
import '../DonHang_Main.css';

const DonHangTableView = ({
    data,
    currentPage,
    pageSize,
    loading,
    handleEdit,
    handleRemove
}) => {
    const columns = getDonHangColumns(handleEdit, handleRemove);

    return (
        <Table
            columns={columns}
            dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
            rowKey="so_don_hang"
            bordered
            size="small"
            pagination={false}
            className="custom-ant-table"
            loading={loading}
        />
    );
};

export default DonHangTableView;
