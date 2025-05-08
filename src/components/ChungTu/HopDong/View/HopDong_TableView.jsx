import React from 'react';
import { Table } from 'antd';
import { getHopDongColumns } from './HopDong_Columns';
import '../HopDong_Main.css';

const HopDongTableView = ({
    data,
    currentPage,
    pageSize,
    loading,
    handleEdit,
    handleRemove
}) => {
    const columns = getHopDongColumns(handleEdit, handleRemove);

    return (
        <div className="bang-hop-dong-scroll-wrapper">
            <div style={{ width: 2000 }}>
                <Table
                    columns={columns}
                    dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    rowKey="so_hop_dong"
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

export default HopDongTableView;
