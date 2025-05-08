import React from 'react';
import { Table } from 'antd';
import { getXuatKhoColumns } from './XuatKho_Columns';
import '../XuatKho_Main.css';

const XuatKhoTableView = ({
    data,
    currentPage,
    pageSize,
    loading,
    handleEdit,
    handleRemove
}) => {
    const columns = getXuatKhoColumns(handleEdit, handleRemove);

    return (
        <div className="bang-xuat-kho-scroll-wrapper">
            <div style={{ width: 1440 }}>
                <Table
                    columns={columns}
                    dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    rowKey="ma_stock_out"
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

export default XuatKhoTableView;
