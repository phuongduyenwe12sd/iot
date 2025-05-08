import { getCountryName } from '../../../utils/transform/countryCodes';
import { normalizeString } from '../../../utils/format/search';

export function filterHangHoa(data, { searchTerm, statusFilter, countryFilter, supplierFilter }) {
    const normalizedSearch = normalizeString(searchTerm || '');

    return data.filter(item => {
      const matchesSearch =
        !searchTerm ||
        normalizeString(item.ma_hang).includes(normalizedSearch) ||
        normalizeString(item.ten_hang).includes(normalizedSearch) ||
        normalizeString(item.product_type?.ten_loai_hang).includes(normalizedSearch);
  
      const matchesStatus =
        statusFilter === 'all' || item.tinh_trang_hang_hoa === statusFilter;
  
      const matchesCountry =
        countryFilter === 'all' || getCountryName(item.nuoc_xuat_xu) === countryFilter;
  
      const matchesSupplier =
        supplierFilter === 'all' || item.suppliers?.ten_nha_cung_cap === supplierFilter;
  
      return matchesSearch && matchesStatus && matchesCountry && matchesSupplier;
    });
  }
  