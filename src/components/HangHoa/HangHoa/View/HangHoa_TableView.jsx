import React from 'react';
import { Table } from 'antd';
import { getHangHoaColumns } from './HangHoa_Columns';
import '../HangHoa_Main.css';

const HangHoaTableView = ({
    data,
    currentPage,
    pageSize,
    loading,
    handleEdit,
    handleRemove
}) => {
    const columns = getHangHoaColumns(handleEdit, handleRemove);

    return (
        <div className="bang-hang-hoa-scroll-wrapper">
            <div style={{ width: 2050 }}>
                <Table
                    columns={columns}
                    dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    rowKey="stt"
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

export default HangHoaTableView;
