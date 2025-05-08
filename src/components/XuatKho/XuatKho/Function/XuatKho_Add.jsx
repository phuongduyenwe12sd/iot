import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import { fetchDataList, createItem } from '../../../utils/api/requestHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';
import NumericInput from '../../../utils/jsx/NumericInput';

const { Option } = Select;

const AddStockOut = ({ onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [newMaStockOut, setNewMaStockOut] = useState('');
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchMaxSTT();
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/maintenance/products', setProducts, 'Không thể tải danh sách hàng hóa').finally(() => setFetchLoading(false));
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/maintenance/accounts', setAccounts, 'Không thể tải danh sách người dùng').finally(() => setFetchLoading(false));
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/maintenance/warehouses', setWarehouses, 'Không thể tải danh sách kho').finally(() => setFetchLoading(false));
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/maintenance/customers', setCustomers, 'Không thể tải danh sách khách hàng').finally(() => setFetchLoading(false));
  }, []);

  const fetchMaxSTT = async () => {
    setFetchLoading(true);
    try {
      const allStock_Out = await fetchDataList('https://dx.hoangphucthanh.vn:3000/maintenance/stock-out');
      const maxSTT = allStock_Out.length ? Math.max(...allStock_Out.map(item => item.stt || 0)) : 0;
      const newSTT = maxSTT + 1;
      const generatedMaStockOut = `XK${String(newSTT)}`;
      setNewMaStockOut(generatedMaStockOut);

      // Gán luôn giá trị mặc định vào form
      form.setFieldsValue({
        ma_stock_out: generatedMaStockOut,
      });

    } catch (error) {
      console.error('Lỗi khi lấy STT:', error);
      message.error('Không thể khởi tạo mã xuất hàng mới');
    } finally {
      setFetchLoading(false);
    }
  };

  const onFinish = async (values) => {
        setLoading(true);
        try {
          const payload = {
            ...values,
            ngay_xuat_hang: values.ngay_xuat_hang?.format('YYYY-MM-DD'),
          };
    
          console.log('🚀 Payload gửi đi:', payload);
    
          const response = await createItem('https://dx.hoangphucthanh.vn:3000/maintenance/stock-out', payload);
    
          console.log('📦 Kết quả thêm mới:', response);
    
          if (response && response.status && response.status >= 400) {
            throw new Error('Thêm mới thất bại từ server');
          }
    
          message.success('Thêm mới xuất hàng thành công!');
          onSuccess?.(); // Callback reload data
        } catch (error) {
          console.error('Lỗi thêm mới:', error);
          message.error('Không thể thêm mới xuất hàng');
        } finally {
          setLoading(false);
        }
      };

  return (
    <div className="edit-container">
      <Card
        title="Thêm mới Xuất Hàng"
        bordered={false}
        className="edit-card"
      >
        {fetchLoading ? (
          <div className="loading-container">
            <Spin tip="Đang tải dữ liệu..." />
          </div>
        ) : (
          <Form form={form} layout="vertical" onFinish={onFinish} className="edit-form">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ma_stock_out" label="Mã xuất" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ma_hang" label="Mã hàng">
                  <Select showSearch optionFilterProp="children" placeholder="Chọn mã hàng">
                    {products
                      .filter((product, index, self) => 
                        index === self.findIndex(p => p.ma_hang === product.ma_hang) // Loại bỏ các mã hàng trùng lặp
                      )
                      .map(product => (
                        <Option key={product.stt} value={product.ma_hang}>
                          {product.ma_hang}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ngay_xuat_hang" label="Ngày xuất hàng" rules={[{ required: true }]}>
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="so_luong_xuat" label="Số lượng" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="nguoi_phu_trach" label="Người phụ trách" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn người phụ trách">
                    {accounts.map(account => (
                      <Option key={account.ma_nguoi_dung} value={account.ma_nguoi_dung}>
                        {account.ho_va_ten}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ten_kho" label="Kho" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn kho">
                    {warehouses.map(warehouse => (
                      <Option key={warehouse.ma_kho} value={warehouse.ma_kho}>
                        {warehouse.ten_kho}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ten_khach_hang" label="Tên khách hàng" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn khách hàng">
                    {customers.map(customer => (
                      <Option key={customer.ma_khach_hang} value={customer.ma_khach_hang}>
                        {customer.ten_khach_hang}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <div className="form-actions">
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>Thêm</Button>
                <Button icon={<CloseOutlined />} onClick={onCancel} danger>Hủy</Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default AddStockOut;
