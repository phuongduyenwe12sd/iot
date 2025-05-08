import React from 'react';
import { Table } from 'antd';
import { getLoaiHangColumns } from './LoaiHang_Columns';
import '../LoaiHang_Main.css';

const LoaiHangTableView = ({
    data,
    currentPage,
    pageSize,
    loading,
    handleEdit,
    handleRemove
}) => {
    const columns = getLoaiHangColumns(handleEdit, handleRemove);

    return (
        <Table
            columns={columns}
            dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
            rowKey="ma_loai_hang"
            bordered
            size="small"
            pagination={false}
            className="custom-ant-table"
            loading={loading}
        />
    );
};

export default LoaiHangTableView;
