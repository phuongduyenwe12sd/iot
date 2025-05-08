import React from 'react';
import { Table } from 'antd';
import { getChiTietDonHangColumns } from './CTDH_Columns';
import '../CTDH_Main.css';

const ChiTietDonHangTableView = ({
    data,
    currentPage,
    pageSize,
    loading,
    handleEdit,
    handleRemove
}) => {
    const columns = getChiTietDonHangColumns(handleEdit, handleRemove);

    return (
        <div className="bang-chi-tiet-don-hang-scroll-wrapper">
            <div style={{ width: 3800 }}>
                <Table
                    columns={columns}
                    dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    rowKey="ma_chi_tiet_don_hang"
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

export default ChiTietDonHangTableView;
