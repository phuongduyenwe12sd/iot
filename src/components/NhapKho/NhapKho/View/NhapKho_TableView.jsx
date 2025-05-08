import React from 'react';
import { Table } from 'antd';
import { getNhapKhoColumns } from './NhapKho_Columns';
import '../NhapKho_Main.css';

const NhapKhoTableView = ({
    data,
    currentPage,
    pageSize,
    loading,
    handleEdit,
    handleRemove
}) => {
    const columns = getNhapKhoColumns(handleEdit, handleRemove);

    return (
        <div className="bang-nhap-kho-scroll-wrapper">
            <div style={{ width: 1440 }}>
                <Table
                    columns={columns}
                    dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    rowKey="ma_stock_in"
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

export default NhapKhoTableView;
