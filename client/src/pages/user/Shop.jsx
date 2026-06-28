import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoOptions, IoClose, IoSearch } from 'react-icons/io5';
import { useShopStore } from '../../store/shopStore';
import { ProductCard, ProductGridSkeleton, ErrorState, EmptyState, Pagination, Button } from '../../components/ui';

const categories = ['Men', 'Women', 'Oversized', 'Streetwear', 'Accessories', 'Shoes'];
const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
const sortOptions = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Biggest Discount' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    products, pagination, productsLoading, productsError, filters,
    setFilters, resetFilters, fetchProducts,
  } = useShopStore();
  const [mobileFilters, setMobileFilters] = useState(false);
  const [tempMinPrice, setTempMinPrice] = useState('');
  const [tempMaxPrice, setTempMaxPrice] = useState('');

  useEffect(() => {
    const cat = searchParams.get('category');
    const search = searchParams.get('search');
    const discount = searchParams.get('discount');
    if (cat) setFilters({ category: cat });
    if (search) setFilters({ search });
    if (discount) setFilters({ discount: discount === 'true' });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters.category, filters.size, filters.discount, filters.page, filters.search]);

  const handleCategory = (cat) => {
    setFilters({ category: cat === filters.category ? '' : cat, page: 1 });
  };

  const handleSize = (size) => {
    setFilters({ size: size === filters.size ? '' : size, page: 1 });
  };

  const handleSort = (e) => {
    setFilters({ sort: e.target.value, page: 1 });
  };

  const handleApplyPrice = (e) => {
    e.preventDefault();
    setFilters({ minPrice: tempMinPrice, maxPrice: tempMaxPrice, page: 1 });
  };

  const handleReset = () => {
    resetFilters();
    setTempMinPrice('');
    setTempMaxPrice('');
    setSearchParams({});
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setFilters({ search: formData.get('search'), page: 1 });
  };

  const FilterContent = ({ mobile = false }) => (
    <div className={mobile ? '' : 'space-y-8'}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider">Filters</h3>
        <button onClick={handleReset} className="text-xs text-accent hover:underline">Clear All</button>
      </div>

      <form onSubmit={handleSearch}>
        <div className="relative">
          <IoSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            name="search"
            defaultValue={filters.search}
            placeholder="Search..."
            className="w-full bg-surface2 border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent transition-all"
          />
        </div>
      </form>

      <div>
        <p className="text-xs text-muted uppercase tracking-wider mb-3">Category</p>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filters.category === cat
                  ? 'accent-gradient text-white border-transparent'
                  : 'bg-surface2 border-border text-secondary hover:border-accent/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted uppercase tracking-wider mb-3">Size</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map(s => (
            <button
              key={s}
              onClick={() => handleSize(s)}
              className={`w-10 h-10 rounded-xl text-xs font-medium border transition-all ${
                filters.size === s
                  ? 'accent-gradient text-white border-transparent'
                  : 'bg-surface2 border-border text-secondary hover:border-accent/30'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted uppercase tracking-wider mb-3">Price Range</p>
        <form onSubmit={handleApplyPrice} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={tempMinPrice}
              onChange={e => setTempMinPrice(e.target.value)}
              className="w-full bg-surface2 border border-border rounded-xl px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent"
            />
            <span className="text-muted">-</span>
            <input
              type="number"
              placeholder="Max"
              value={tempMaxPrice}
              onChange={e => setTempMaxPrice(e.target.value)}
              className="w-full bg-surface2 border border-border rounded-xl px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="w-full">Apply</Button>
        </form>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.discount}
          onChange={e => setFilters({ discount: e.target.checked, page: 1 })}
          className="w-4 h-4 rounded border-border bg-surface2 text-accent focus:ring-accent/30"
        />
        <span className="text-sm">Discounted Items Only</span>
      </label>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display italic">Shop</h1>
            <p className="text-secondary text-sm mt-1">
              {pagination.totalProducts} products found
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={filters.sort || ''}
              onChange={handleSort}
              className="bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-accent cursor-pointer"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setMobileFilters(true)}
              className="lg:hidden p-2.5 rounded-xl bg-surface2 border border-border hover:bg-surface3 transition-all"
            >
              <IoOptions size={18} />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-8 p-6 rounded-2xl border border-border bg-surface/50">
              <FilterContent />
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {productsLoading ? (
              <ProductGridSkeleton count={12} />
            ) : productsError ? (
              <ErrorState message={productsError} onRetry={fetchProducts} />
            ) : products.length === 0 ? (
              <EmptyState
                icon={IoSearch}
                title="No products found"
                description="Try adjusting your filters or search terms."
                action="Reset Filters"
                onAction={handleReset}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product, i) => (
                    <ProductCard key={product._id} product={product} index={i} />
                  ))}
                </div>
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => {
                    setFilters({ page });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileFilters(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-surface shadow-xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setMobileFilters(false)} className="p-2 rounded-full hover:bg-surface2">
                  <IoClose size={20} />
                </button>
              </div>
              <FilterContent mobile />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
