import React from 'react';
import { Spin } from 'antd';

const Loading = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column'
        }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Loading...</p>
        </div>
    );
};

export default Loading;