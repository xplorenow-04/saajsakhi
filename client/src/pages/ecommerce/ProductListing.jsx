import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { productApi } from "../../api/product.api";
import Navbar from "../../components/ecommerce/Navbar";
import Footer from "../../components/ecommerce/Footer";
import ProductCard from "../../components/ecommerce/ProductCard";
import LoadingSkeleton from "../../components/ecommerce/LoadingSkeleton";
import EmptyState from "../../components/ecommerce/EmptyState";

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount", label: "Biggest Discount" },
  { value: "popular", label: "Most Popular" },
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const discountRanges = [
  { value: "10", label: "10% and above" },
  { value: "20", label: "20% and above" },
  { value: "30", label: "30% and above" },
  { value: "40", label: "40% and above" },
  { value: "50", label: "50% and above" },
  { value: "60", label: "60% and above" },
  { value: "70", label: "70% and above" },
];

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentSearch = searchParams.get("search") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentSizes = searchParams.getAll("size");
  const currentDiscount = searchParams.get("discount") || "";

  const updateParams = useCallback(
    (updates) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      if (updates.page === undefined && !updates.hasOwnProperty("page")) {
        newParams.set("page", "1");
      }
      setSearchParams(newParams, { replace: true });
    },
    [searchParams]
  );

  const toggleSize = (size) => {
    const newParams = new URLSearchParams(searchParams);
    const current = newParams.getAll("size");
    if (current.includes(size)) {
      newParams.delete("size");
      current.filter((s) => s !== size).forEach((s) => newParams.append("size", s));
    } else {
      newParams.append("size", size);
    }
    newParams.set("page", "1");
    setSearchParams(newParams, { replace: true });
  };

  const clearAllFilters = () => {
    setSearchParams({}, { replace: true });
    setSearchInput("");
  };

  const hasActiveFilters =
    currentCategory ||
    currentSort !== "newest" ||
    currentSearch ||
    currentMinPrice ||
    currentMaxPrice ||
    currentSizes.length > 0 ||
    currentDiscount;

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 12,
          sort: currentSort,
        };
        if (currentCategory) params.category = currentCategory;
        if (currentSearch) params.search = currentSearch;
        if (currentMinPrice) params.minPrice = currentMinPrice;
        if (currentMaxPrice) params.maxPrice = currentMaxPrice;
        if (currentSizes.length > 0) params.size = currentSizes.join(",");
        if (currentDiscount) params.discount = currentDiscount;

        const res = await productApi.listProducts(params);
        if (res.success) {
          const data = res.data;
          if (Array.isArray(data)) {
            setProducts(data);
            setTotalPages(1);
            setTotalProducts(data.length);
          } else {
            setProducts(data.products || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalProducts(data.pagination?.total || 0);
          }
        } else {
          toast.error(res.message || "Failed to load products");
        }
      } catch {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await productApi.getCategories();
        if (res.success) setCategories(res.data || []);
      } catch {
        /* silently fail */
      }
    };

    fetchProducts();
    fetchCategories();
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim(), page: "1" });
  };

  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Category Filter */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
          Category
        </h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={!currentCategory}
              onChange={() => updateParams({ category: "" })}
              className="w-4 h-4 rounded bg-surface-700 border-surface-500 text-accent focus:ring-accent/30 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              All
            </span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat._id || cat.slug}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={currentCategory === cat.slug}
                onChange={() =>
                  updateParams({ category: currentCategory === cat.slug ? "" : cat.slug })
                }
                className="w-4 h-4 rounded bg-surface-700 border-surface-500 text-accent focus:ring-accent/30 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentMinPrice}
            onChange={(e) => updateParams({ minPrice: e.target.value })}
            className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
          />
          <span className="text-text-muted text-sm">-</span>
          <input
            type="number"
            placeholder="Max"
            value={currentMaxPrice}
            onChange={(e) => updateParams({ maxPrice: e.target.value })}
            className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
          />
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
          Size
        </h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const isActive = currentSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-all ${isActive
                    ? "bg-accent border-accent text-white"
                    : "bg-surface-800 border-surface-600 text-text-muted hover:border-accent/50 hover:text-accent"
                  }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discount Filter */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
          Discount
        </h4>
        <div className="space-y-2">
          {discountRanges.map((range) => (
            <label
              key={range.value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="discount"
                checked={currentDiscount === range.value}
                onChange={() =>
                  updateParams({
                    discount: currentDiscount === range.value ? "" : range.value,
                  })
                }
                className="w-4 h-4 accent-accent cursor-pointer"
              />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              {currentCategory
                ? categories.find((c) => c.slug === currentCategory)?.name ||
                "Products"
                : "All Products"}
            </h1>
            {!loading && (
              <p className="text-sm text-text-muted mt-1">
                {totalProducts} product{totalProducts !== 1 ? "s" : ""} found
              </p>
            )}
          </div>

          {/* Top Bar: Search + Sort + Mobile Filter Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-surface-800 border border-surface-600 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>
            </form>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={currentSort}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  className="appearance-none bg-surface-800 border border-surface-600 rounded-xl pl-4 pr-10 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
              </div>

              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-surface-800 border border-surface-600 rounded-xl px-4 py-3 text-sm text-text-secondary hover:border-accent/50 transition-all"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {currentCategory && (
                <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-xs font-medium px-3 py-1.5 rounded-full">
                  {categories.find((c) => c.slug === currentCategory)?.name ||
                    currentCategory}
                  <button
                    onClick={() => updateParams({ category: "" })}
                    className="hover:text-accent-light"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {currentSizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  Size {size}
                  <button onClick={() => toggleSize(size)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              {currentDiscount && (
                <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-xs font-medium px-3 py-1.5 rounded-full">
                  {currentDiscount}%+ off
                  <button onClick={() => updateParams({ discount: "" })}>
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-secondary text-xs font-medium px-3 py-1.5 rounded-full border border-surface-600 hover:border-surface-500 transition-all"
              >
                <RotateCcw size={12} />
                Clear All
              </button>
            </div>
          )}

          <div className="flex gap-8 lg:gap-10">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-28 bg-surface-800/50 border border-surface-700/50 rounded-2xl p-6">
                <FilterSidebar />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                  <LoadingSkeleton type="card" count={8} />
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      <button
                        onClick={() =>
                          updateParams({ page: String(currentPage - 1) })
                        }
                        disabled={currentPage <= 1}
                        className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {Array.from(
                        { length: Math.min(totalPages, 7) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 7) {
                            pageNum = i + 1;
                          } else if (currentPage <= 4) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 3) {
                            pageNum = totalPages - 6 + i;
                          } else {
                            pageNum = currentPage - 3 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() =>
                                updateParams({ page: String(pageNum) })
                              }
                              className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${currentPage === pageNum
                                  ? "bg-accent text-white shadow-lg shadow-accent/25"
                                  : "bg-surface-800 border border-surface-700 text-text-muted hover:text-accent hover:border-accent/50"
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() =>
                          updateParams({ page: String(currentPage + 1) })
                        }
                        disabled={currentPage >= totalPages}
                        className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={Package}
                  title="No products found"
                  description="Try adjusting your filters or search terms"
                  actionLabel="Clear Filters"
                  actionLink="/shop"
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-surface-900 border-l border-surface-700 overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-surface-900 border-b border-surface-700 px-5 py-4 flex items-center justify-between z-10">
              <h3 className="text-base font-semibold text-text-primary">
                Filters
              </h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-700 text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <FilterSidebar />
            </div>
            <div className="sticky bottom-0 bg-surface-900 border-t border-surface-700 px-5 py-4">
              <button
                onClick={() => {
                  clearAllFilters();
                  setMobileFiltersOpen(false);
                }}
                className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 rounded-xl transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
