import React from 'react';
import { Table } from 'antd';
import { getBillColumns } from './Bill_Columns';
import '../Bill_Main.css';

const BillTableView = ({
    data,
    currentPage,
    pageSize,
    loading,
    handleEdit,
    handleRemove
}) => {
    const columns = getBillColumns(handleEdit, handleRemove);

    return (
        <Table
            columns={columns}
            dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
            rowKey="ma_bill"
            bordered
            size="small"
            pagination={false}
            className="custom-ant-table"
            loading={loading}
        />
    );
};

export default BillTableView;
