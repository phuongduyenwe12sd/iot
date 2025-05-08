import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import LayoutApp from "../components/layout/Layout";
import Loading from "../components/common/Loading";

const Home = lazy(() => import("../components/Home/Home"));
// Fix: Use correct file name and component name
const HangHoa = lazy(() => import("../components/HangHoa/HangHoa/HangHoa_Main"));
const LoaiHang = lazy(() => import("../components/HangHoa/LoaiHang/LoaiHang_Main"));
const NhaCungCap = lazy(() => import("../components/NhaCungCap/NCC_Main"));
const KhachHang = lazy(() => import("../components/KhachHang/KhachHang/KhachHang_Main"));
const HopDong = lazy(() => import("../components/ChungTu/HopDong/HopDong_Main"));
const LoaiHopDong = lazy(() => import("../components/ChungTu/LoaiHopDong/LoaiHopDong_Main"));
const Bill = lazy(() => import("../components/ChungTu/Bill/Bill_Main"));
const NhapKho = lazy(() => import("../components/NhapKho/NhapKho/NhapKho_Main"));
const XuatKho = lazy(() => import("../components/XuatKho/XuatKho/XuatKho_Main"));
const TonKho = lazy(() => import("../components/TonKho/TonKho/TonKho_Main"));
const DonHang = lazy(() => import("../components/DatHang/DonHang/DonHang_Main"));
const ChiTietDonHang = lazy(() => import("../components/DatHang/ChiTietDonHang/CTDH_Main"));
const ProductsDetail = lazy(() => import("../components/Products/productTypes/productType"));
const Profile = lazy(() => import("../components/profile/Profile"));
const LineChart = lazy(() => import("../components/Chart/LineChart"));
const Suppliers = lazy(() => import("../components/Suppliers/Suppliers"));
const AddSupplier = lazy(() => import("../components/Suppliers/AddSupplier"));
const Explain = lazy(() => import("../components/Explain/Explain"));

function MainAppRoutes() {
  return (
    <LayoutApp>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Route chính, redirect từ "/" đến "/home" */}
          <Route path="/" element={<Home />} />
          {/* Route Home */}
          <Route path="/home" element={<Home />} />
          {/* Route Suppliers */}
          <Route path="/suppliers" element={<NhaCungCap />} />
          <Route path="/suppliers1" element={<Suppliers />} />
          <Route path="/suppliers/add" element={<AddSupplier />} />

          {/* Route Customers */}
          <Route path="/customers" element={<KhachHang />} />

          {/* Route Contracts */}
          <Route path="/contracts" element={<HopDong />} />
          <Route path="/contract_type" element={<LoaiHopDong />} />
          <Route path="/bill" element={<Bill />} />
      
          {/* Route Products */}
          <Route path="/product_type" element={<LoaiHang />} />
          <Route path="/products" element={<HangHoa />} />
          <Route path="/test_product_type" element={<ProductsDetail />} />

          {/* Route Stock In */}
          <Route path="/stock_in" element={<NhapKho />} />

          {/* Route Stock Out */}
          <Route path="/stock_out" element={<XuatKho />} />

          {/* Route Inventory */}
          <Route path="/inventory" element={<TonKho />} />

          {/* Route Order */}
          <Route path="/order" element={<DonHang />} />
          <Route path="/order_detail" element={<ChiTietDonHang />} />
          
          {/* Route Profile */}
          <Route path="/profile" element={<Profile />} />
          {/* Route Statistic */}
          <Route path="/statistic" element={<LineChart />} />
          {/* Route Explain */}
          <Route path="/bao_gia" element={<Explain />} />
          {/* Route 404 hoặc catch-all (tùy chọn) */}
          <Route path="*" element={<Home />} /> {/* Hoặc redirect đến trang 404 */}
        </Routes>
      </Suspense>
    </LayoutApp>
  );
}

export default MainAppRoutes;