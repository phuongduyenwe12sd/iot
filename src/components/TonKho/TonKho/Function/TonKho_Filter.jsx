import React from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUniqueValues } from '../../../utils/data/dataFilter';
import '../../../utils/css/Custom-Filter.css';

const { Option } = Select;

const TonKhoFilter = ({
  data,
  searchTerm,
  setSearchTerm,
  yearFilter,
  setYearFilter,
  product_typeFilter,
  setProductTypeFilter,
  warehouseFilter,
  setWarehouseFilter,
  onRefresh,
  loading
}) => {
  const uniqueYears = getUniqueValues(data, (item) => item.nam)
  const uniqueProductTypes = getUniqueValues(data, (item) => item.product_type?.ten_loai_hang);
  const uniqueWarehouses = getUniqueValues(data, (item) => item.warehouse?.ten_kho);
  
  return (
    <div className="filters">
      <Input
        placeholder="Tìm kiếm theo mã hàng"
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Select value={yearFilter} onChange={setYearFilter}>
        <Option value="all">Năm</Option>
        {uniqueYears.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Select value={product_typeFilter} onChange={setProductTypeFilter}>
        <Option value="all">Loại hàng</Option>
        {uniqueProductTypes.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Select value={warehouseFilter} onChange={setWarehouseFilter}>
        <Option value="all">Kho</Option>
        {uniqueWarehouses.map((item) => (
          <Option key={item} value={item}>{item}</Option>
        ))}
      </Select>
      <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
        Làm mới
      </Button>
    </div>
  );
};

export default TonKhoFilter;
