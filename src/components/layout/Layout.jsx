import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
import { Layout, Menu, Breadcrumb, Avatar, message } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  InboxOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  ShopOutlined,
  DownloadOutlined,
  UploadOutlined,
  DatabaseOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import './layout.css';

const showComingSoon = () => {
  message.info("🎉 Tính năng này đang được phát triển nha! Bạn quay lại sau nhé 😉");
};

const { Header, Content, Footer } = Layout;
const { SubMenu } = Menu;

function LayoutApp(props) {
  const { children } = props;
  const navigation = useNavigate();
  const [current, setCurrent] = useState('mail');

  let keyMenu;
  let tmp = window.location.pathname;
  let tmpArr = tmp.split('/');
  keyMenu = `/${tmpArr[1]}`;

  const handleClick = (event) => {
    setCurrent(event.key);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigation('/');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="site-layout-background" style={{ padding: 0, position: 'sticky', top: 0, zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px',
          }}
        >
          <div className="logo" style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
            <a href="https://hoangphucthanh.vn/" style={{ color: '#fff', textDecoration: 'none' }}>
              HOPT.DX
            </a>
          </div>

          {/* Menu điều hướng */}
          <Menu
            onClick={handleClick}
            selectedKeys={[current]}
            mode="horizontal"
            className="header-menu"
          >
            {/* Trang chủ */}
            <Menu.Item key="/" icon={<HomeOutlined />}>
              <NavLink to="/">Trang Chủ</NavLink>
            </Menu.Item>

            {/* Kho Hàng */}
            <Menu.Item key="warehouse" icon={<InboxOutlined />} onClick={showComingSoon}>
              Kho Hàng
            </Menu.Item>

            {/* Nhà Cung Cấp */}
            <SubMenu
              key="suppliers"
              icon={<SolutionOutlined />}
              title="Nhà Cung Cấp"
              onTitleClick={() => navigation('/suppliers')}
            >
              <Menu.Item key="/suppliers"><NavLink to="/suppliers">Danh sách nhà cung cấp</NavLink></Menu.Item>
              <Menu.Item key="/suppliers/add"><NavLink to="/suppliers/add">Nhà cung cấp mới</NavLink></Menu.Item>
              <Menu.Item key="/suppliers1"><NavLink to="/suppliers1">Nhà cung cấp mẫu</NavLink></Menu.Item>
            </SubMenu>

            {/* Khách Hàng */}
            <SubMenu
              key="customers"
              icon={<TeamOutlined />}
              title="Khách Hàng"
              onTitleClick={() => navigation('/customers')}
            >
              <Menu.Item key="/customers"><NavLink to="/customers">Khách hàng</NavLink></Menu.Item>
              <Menu.Item key="new_customer" onClick={showComingSoon}>Khách hàng mới</Menu.Item>
              <Menu.Item key="by_city" onClick={showComingSoon}>Thống kê KH theo tỉnh thành</Menu.Item>
              <Menu.Item key="by_staff" onClick={showComingSoon}>Thống kê KH theo người phụ trách</Menu.Item>
              <Menu.Item key="by_source" onClick={showComingSoon}>Thống kê KH theo nguồn tiếp cận</Menu.Item>
              <Menu.Item key="competitor" onClick={showComingSoon}>Đối thủ mới</Menu.Item>
            </SubMenu>

            {/* Chứng Từ */}
            <SubMenu
              key="contracts"
              icon={<FileTextOutlined />}
              title="Chứng Từ"
              onTitleClick={() => navigation('/contracts')}
            >
              <Menu.Item key="/contract_type"><NavLink to="/contract_type">Loại hợp đồng</NavLink></Menu.Item>
              <Menu.Item key="/contracts"><NavLink to="/contracts">Hợp Đồng</NavLink></Menu.Item>
              <Menu.Item key="/bill"><NavLink to="/bill">Các Bill</NavLink></Menu.Item>
            </SubMenu>

            {/* Hàng Hóa */}
            <SubMenu
              key="products"
              icon={<ShopOutlined />}
              title="Hàng Hóa"
              onTitleClick={() => navigation('/products')}
            >
              <Menu.Item key="/product_type"><NavLink to="/product_type">Loại hàng hóa</NavLink></Menu.Item>
              <Menu.Item key="/products"><NavLink to="/products">Danh mục hàng hóa</NavLink></Menu.Item>
              <Menu.Item key="" onClick={showComingSoon}>Ảnh hàng hóa</Menu.Item>
            </SubMenu>

            {/* Nhập Kho */}
            <SubMenu
              key="stock_in"
              icon={<DownloadOutlined />}
              title="Nhập Kho"
              onTitleClick={() => navigation('/stock_in')}
            >
              <Menu.Item key="/stock_in"><NavLink to="/stock_in">Nhập hàng</NavLink></Menu.Item>
              <Menu.Item key="" onClick={showComingSoon}>Thống kê hàng nhập theo tháng</Menu.Item>
            </SubMenu>

            {/* Xuất Kho */}
            <SubMenu
              key="stock_out"
              icon={<UploadOutlined />}
              title="Xuất Kho"
              onTitleClick={() => navigation('/stock_out')}
            >
              <Menu.Item key="/stock_out"><NavLink to="/stock_out">Xuất hàng</NavLink></Menu.Item>
              <Menu.Item key="" onClick={showComingSoon}>Thống kê hàng xuất theo tháng</Menu.Item>
              <Menu.Item key="" onClick={showComingSoon}>Thống kê hàng xuất theo khách hàng</Menu.Item>
            </SubMenu>

            {/* Tồn Kho */}
            <SubMenu
              key="inventory"
              icon={<DatabaseOutlined />}
              title="Tồn Kho"
              onTitleClick={() => navigation('/inventory')}
            >
              <Menu.Item key="" onClick={showComingSoon}>Kiểm kê kho</Menu.Item>
              <Menu.Item key="/inventory"><NavLink to="/inventory">Tồn kho</NavLink></Menu.Item>
              <Menu.Item key="" onClick={showComingSoon}>Thống kê hàng nhập và xuất theo tháng</Menu.Item>
            </SubMenu>

            {/* Đặt Hàng */}
            <SubMenu
              key="order"
              icon={<ShoppingCartOutlined />}
              title="Đặt Hàng"
              onTitleClick={() => navigation('/order_detail')}
            >
              <Menu.Item key="/order"><NavLink to="/order">Đơn hàng</NavLink></Menu.Item>
              <Menu.Item key="/order_detail"><NavLink to="/order_detail">Chi tiết đơn hàng</NavLink></Menu.Item>
              <Menu.Item key="" onClick={showComingSoon}>Thống kê hàng đặt theo tháng</Menu.Item>
              <Menu.Item key="" onClick={showComingSoon}>Thống kê hàng đặt theo khách hàng</Menu.Item>
            </SubMenu>

            {/* Báo giá
            <Menu.Item key="/bao_gia" icon={<DollarOutlined />}>
              <NavLink to="/bao_gia">Báo Giá</NavLink>
            </Menu.Item> */}

            {/* Tài khoản */}
            <SubMenu
              key="user"
              icon={
                <IconButton aria-label="user">
                  <Avatar size="large" icon={<UserOutlined />} />
                </IconButton>
              }
            >
              <Menu.Item key="logout" onClick={handleLogout}>Log out</Menu.Item>
            </SubMenu>
          </Menu>
        </div>
      </Header>
      <Layout className="site-layout">
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '8px 0', color: '#fff' }}>
            <Breadcrumb.Item> </Breadcrumb.Item>
            <Breadcrumb.Item></Breadcrumb.Item>
          </Breadcrumb>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <h3>Warehouse</h3>
        </Footer>
      </Layout>
    </Layout>
  );
}

export default LayoutApp;