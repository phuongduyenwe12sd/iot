import React from 'react';
import { Button } from 'antd';
import { ImportOutlined, ExportOutlined, PlusOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';

const AreaHeader = ({ title, onImportClick, onExportClick, onAddClick, onReloadClick, ImportComponent, hideAddButton }) => {
    return (
        <div className="area-header">
            <h2 className="custom-title">{title}</h2>
            <div className="button-level1">
                {onImportClick && (
                    <Button icon={<ImportOutlined />} onClick={onImportClick}>
                        Nhập File
                    </Button>
                )}
                {onExportClick && (
                    <Button icon={<ExportOutlined />} onClick={onExportClick}>
                        Xuất File
                    </Button>
                )}
                {onReloadClick && (
                    <Button icon={<DownloadOutlined />} onClick={onReloadClick}>
                        Lấy dữ liệu
                    </Button>
                )}
                {!hideAddButton && onAddClick && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={onAddClick}>
                        Thêm mới
                    </Button>
                )}
            </div>
            {ImportComponent}
        </div>
    );
};

export default AreaHeader;
