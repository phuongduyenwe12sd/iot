import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Layout, Menu, Breadcrumb, Avatar, message } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  DashboardOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  HeatMapOutlined,
  RadarChartOutlined,
} from '@ant-design/icons';
import uteLogo from './UTE.jpg';  // Đặt file ute.png trong thư mục layout


import './layout.css';

const showComingSoon = () => {
  message.info("🎉 Tính năng này đang được phát triển nha! Bạn quay lại sau nhé 😉");
};

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

function LayoutApp(props) {
  const { children } = props;
  const navigation = useNavigate();
  const [current, setCurrent] = useState('mail');
  const [collapsed, setCollapsed] = useState(false);

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
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={value => setCollapsed(value)}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0
        }}
      >
        <div className="logo" style={{
          color: '#fff',
          fontSize: collapsed ? '12px' : '20px',
          fontWeight: 'bold',
          padding: '16px',
          textAlign: 'center',
          height: collapsed ? '160px' : '200px',  // Increased height for two logos
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <a href="/" style={{ color: '#fff', textDecoration: 'none', marginBottom: '10px' }}>
            {collapsed ? 'FEEE' : 'FEEE'}
          </a>
          {/* First logo */}
          <img
            src={uteLogo}
            alt="UTE Logo"
            style={{
              width: collapsed ? '40px' : '80px',
              height: 'auto',
              marginTop: '5px',
              marginBottom: '10px',
              transition: 'width 0.2s'
            }}
          />
          {/* Second logo */}

        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={['/']}
          selectedKeys={[keyMenu]}
          mode="inline"
        >
          {/* Dashboard Section */}
          <SubMenu key="dashboard" icon={<DashboardOutlined />} title="Dashboard">
            <Menu.Item key="/" icon={<HomeOutlined />}>
              <NavLink to="/">Overview</NavLink>
            </Menu.Item>
            <Menu.Item key="/analytics" icon={<BarChartOutlined />}>
              <NavLink to="/analytics">Analytics</NavLink>
            </Menu.Item>
            {/* <Menu.Item key="/monitoring" icon={<RadarChartOutlined />}>
              <NavLink to="/monitoring">Sensor Monitoring</NavLink>
            </Menu.Item> */}
          </SubMenu>

          {/* Charts Section */}
          <SubMenu key="charts" icon={<LineChartOutlined />} title="Charts">
            {/* <Menu.Item key="/bar-charts" icon={<BarChartOutlined />}>
              <NavLink to="/bar-charts">Bar Charts</NavLink>
            </Menu.Item>
            <Menu.Item key="/line-charts" icon={<LineChartOutlined />}>
              <NavLink to="/line-charts">Line Charts</NavLink>
            </Menu.Item>
            <Menu.Item key="/pie-charts" icon={<PieChartOutlined />}>
              <NavLink to="/pie-charts">Pie Charts</NavLink>
            </Menu.Item> */}
            <Menu.Item key="/area-charts" icon={<AreaChartOutlined />}>
              <NavLink to="/area-charts">Area Charts</NavLink>
            </Menu.Item>
          </SubMenu>

          {/* Maps Section */}
          <SubMenu key="maps" icon={<GlobalOutlined />} title="Maps">
            <Menu.Item key="/location-map" icon={<EnvironmentOutlined />}>
              <NavLink to="/location-map">Location Map</NavLink>
            </Menu.Item>
            {/* <Menu.Item key="/heatmap" icon={<HeatMapOutlined />}>
              <NavLink to="/heatmap">Heat Map</NavLink>
            </Menu.Item>
            <Menu.Item key="/distribution-map" icon={<GlobalOutlined />}>
              <NavLink to="/distribution-map">Distribution Map</NavLink>
            </Menu.Item> */}
          </SubMenu>

          {/* Settings */}
          {/* <Menu.Item key="settings" icon={<SettingOutlined />}>
            <NavLink to="/settings">Cấu hình</NavLink>
          </Menu.Item> */}
        </Menu>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{
          background: '#fff',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}>
          <div style={{ marginLeft: 'auto' }}>
            <Avatar
              size="large"
              icon={<UserOutlined />}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                Menu.open({
                  items: [
                    { label: 'Thông tin cá nhân', key: 'profile' },
                    { label: 'Đăng xuất', key: 'logout', onClick: handleLogout }
                  ]
                });
              }}
            />
          </div>
        </Header>

        <Content style={{ margin: '16px', padding: '16px', background: '#fff', borderRadius: '4px' }}>
          <Breadcrumb style={{ marginBottom: '16px' }}>
            <Breadcrumb.Item>
              <NavLink to="/">Home</NavLink>
            </Breadcrumb.Item>
            {tmpArr[1] && <Breadcrumb.Item>{tmpArr[1].charAt(0).toUpperCase() + tmpArr[1].slice(1)}</Breadcrumb.Item>}
            {tmpArr[2] && <Breadcrumb.Item>{tmpArr[2]}</Breadcrumb.Item>}
          </Breadcrumb>
          <div style={{ minHeight: 'calc(100vh - 180px)' }}>
            {children}
          </div>
        </Content>

        <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
          Management System ©{new Date().getFullYear()} Created by Duyên
        </Footer>
      </Layout>
    </Layout>
  );
}

export default LayoutApp;