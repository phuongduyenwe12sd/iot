import React from 'react';
import { Table } from 'antd';
import { getKhachHangColumns } from './KhachHang_Columns';
import '../KhachHang_Main.css';

const KhachHangTableView = ({
    data,
    currentPage,
    pageSize,
    loading,
    handleEdit,
    handleRemove
}) => {
    const columns = getKhachHangColumns(handleEdit, handleRemove);

    return (
        <div className="bang-khach-hang-scroll-wrapper">
            <div style={{ width: 2050 }}>
                <Table
                    columns={columns}
                    dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    rowKey="ma_khach_hang"
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

export default KhachHangTableView;
