import React from 'react';
import { Table } from 'antd';
import { getTonKhoColumns } from './TonKho_Columns';
import '../TonKho_Main.css';

const TonKhoTableView = ({
    data,
    currentPage,
    pageSize,
    loading,
    handleEdit,
    handleRemove
}) => {
    const columns = getTonKhoColumns(handleEdit, handleRemove);

    return (
        <div className="bang-ton-kho-scroll-wrapper">
            <div style={{ width: 1440 }}>
                <Table
                    columns={columns}
                    dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    rowKey="ma_inventory"
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

export default TonKhoTableView;
