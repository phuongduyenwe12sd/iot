import { normalizeString } from '../../../utils/format/search';

export function filterTonKho(data, { searchTerm, yearFilter, product_typeFilter, warehouseFilter }) {
    const normalizedSearch = normalizeString(searchTerm || '');

    return data.filter(item => {
      const matchesSearch =
        !searchTerm ||
        normalizeString(item.ma_hang).includes(normalizedSearch);

      const matchesYear =
        yearFilter === 'all' ||item.nam === yearFilter;
  
      const matchesProductType =
        product_typeFilter === 'all' || item.product_type?.ten_loai_hang === product_typeFilter;
  
      const matchesWarehouse =
        warehouseFilter === 'all' || item.warehouse?.ten_kho === warehouseFilter;
  
      return matchesSearch && matchesYear && matchesProductType && matchesWarehouse;
    });
  }
  