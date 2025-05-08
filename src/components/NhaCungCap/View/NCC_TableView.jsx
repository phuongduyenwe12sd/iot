import React from 'react';
import { Table } from 'antd';
import { getNhaCungCapColumns } from './NCC_Columns';
import '../NCC_Main.css';

const NhaCungCapTableView = ({
    data,
    currentPage,
    pageSize,
    loading,
    handleEdit,
    handleRemove
}) => {
    const columns = getNhaCungCapColumns(handleEdit, handleRemove);

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
