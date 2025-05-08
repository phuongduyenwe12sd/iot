import React from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUniqueValues } from '../../../utils/data/dataFilter';
import '../../../utils/css/Custom-Filter.css';

const { Option } = Select;

const XuatKhoFilter = ({
  data,
  searchTerm,
  setSearchTerm,
  accountFilter,
  setAccountFilter,
  warehouseFilter,
  setWarehouseFilter,
  yearFilter,
  setYearFilter,
  onRefresh,
  loading
}) => {
  const uniqueAccounts = getUniqueValues(data, (item) => item.accounts?.ho_va_ten);
  const uniqueWarehouses = getUniqueValues(data, (item) => item.warehouse?.ten_kho);
  const uniqueYears = getUniqueValues(data, (item) =>
    new Date(item.ngay_xuat_hang).getFullYear().toString()
  );

  return (
    <div className="filters">
      <Input
        placeholder="Tìm kiếm theo mã hàng, khách hàng"
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Select value={accountFilter} onChange={setAccountFilter}>
        <Option value="all">Người phụ trách</Option>
        {uniqueAccounts.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Select value={warehouseFilter} onChange={setWarehouseFilter}>
        <Option value="all">Kho</Option>
        {uniqueWarehouses.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Select value={yearFilter} onChange={setYearFilter}>
        <Option value="all">Năm</Option>
        {uniqueYears.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
        Làm mới
      </Button>
    </div>
  );
};

export default XuatKhoFilter;
