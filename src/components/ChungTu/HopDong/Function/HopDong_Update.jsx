import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, message, Select, DatePicker, Spin, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from '../../../utils/format/dayjs-config';
import { fetchDataList, updateItemById } from '../../../utils/api/requestHelpers';
import { fetchAndSetList } from '../../../utils/api/fetchHelpers';
import '../../../utils/css/Custom-Update.css';
import NumericInput from '../../../utils/jsx/NumericInput';

const { Option } = Select;

const Editcontract = ({ contractId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [contractData, setContractData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract_types, setContract_Types] = useState([]);

  useEffect(() => {
    if (contractId) fetchcontractData(contractId);
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/maintenance/accounts', setAccounts, 'Không thể tải danh sách người dùng');
    fetchAndSetList('https://dx.hoangphucthanh.vn:3000/maintenance/contract-types', setContract_Types, 'Không thể tải danh sách loại hàng');
  }, [contractId]);

  const fetchcontractData = async (id) => {
    setFetchLoading(true);
    try {
      const allContracts = await fetchDataList('https://dx.hoangphucthanh.vn:3000/maintenance/contracts');
      const contract = allContracts.find(item => item.so_hop_dong === id);
      if (!contract) throw new Error(`Không tìm thấy hợp đồng với số: ${id}`);
      setContractData(contract);
      form.setFieldsValue({
        ...contract,
        ngay_ky_hop_dong: contract.ngay_ky_hop_dong ? dayjs(contract.ngay_ky_hop_dong) : null,
        ngay_bat_dau: contract.ngay_bat_dau ? dayjs(contract.ngay_bat_dau) : null,
        ngay_ket_thuc: contract.ngay_ket_thuc ? dayjs(contract.ngay_ket_thuc) : null,
      });      
      message.success(`Đã tải thông tin hợp đồng: ${contract.so_hop_dong}`);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      message.error(error.message);
    } finally {
      setFetchLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        ngay_ky_hop_dong: values.ngay_ky_hop_dong?.format('YYYY-MM-DD'),
        ngay_bat_dau: values.ngay_bat_dau?.format('YYYY-MM-DD'),
        ngay_ket_thuc: values.ngay_ket_thuc?.format('YYYY-MM-DD'),
      };
      
      console.log('🚀 Payload gửi đi:', payload);

      const response = await updateItemById(`https://dx.hoangphucthanh.vn:3000/maintenance/contracts/${contractId}`, payload);

      console.log('📦 Kết quả cập nhật:', response);

      // Kiểm tra nếu response là lỗi
      if (response && response.status && response.status >= 400) {
        throw new Error('Cập nhật thất bại từ server');
      }

      message.success('Cập nhật hợp đồng thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      message.error('Không thể cập nhật hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-container">
      <Card
        title={`Chỉnh sửa Hợp Đồng: ${contractData?.so_hop_dong || contractId}`}
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
                <Form.Item name="so_hop_dong" label="Số hợp đồng" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="loai_hop_dong" label="Loại hợp đồng" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn loại hợp đồng">
                    {contract_types.map(contract => (
                      <Option key={contract.ma_loai_hop_dong} value={contract.ma_loai_hop_dong}>
                        {contract.ten_loai_hop_dong}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ngay_ky_hop_dong" label="Ngày ký hợp đồng" rules={[{ required: true }]}>
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="gia_tri_hop_dong" label="Giá trị hợp đồng" rules={[{ required: true }]}>
                 <NumericInput style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ngay_bat_dau" label="Ngày bắt đầu" rules={[{ required: true }]}>
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ngay_ket_thuc" label="Ngày kết thúc" rules={[{ required: true }]}>
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="trang_thai_hop_dong" label="Trạng thái" rules={[{ required: true }]}>
                  <Select>
                    {['Còn hiệu lực', 'Hết hạn', 'Đã hủy'].map(status => (
                      <Option key={status} value={status}>{status}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="doi_tac_lien_quan" label="Đối tác liên quan">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="dieu_khoan_thanh_toan" label="Điều khoản thanh toán">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="tep_dinh_kem" label="Tệp đính kèm">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="vi_tri_luu_tru" label="Vị trí lưu trữ">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="nguoi_tao" label="Người tạo" rules={[{ required: true }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Chọn người tạo">
                    {accounts.map(account => (
                      <Option key={account.ma_nguoi_dung} value={account.ma_nguoi_dung}>
                        {account.ho_va_ten}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="mo_ta" label="Mô tả">
              <Input.TextArea rows={3} />
            </Form.Item>
            <div className="form-actions">
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Lưu
              </Button>
              <Button icon={<CloseOutlined />} onClick={onCancel} danger>
                Hủy
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default Editcontract;
