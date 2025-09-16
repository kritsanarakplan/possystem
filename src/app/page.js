"use client";
import { useState, useEffect } from "react";
import { Package, Store, DollarSign, TrendingUp, AlertTriangle, BarChart3, ShoppingCart, Users } from 'lucide-react';

export default function DashboardPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch("api/stores/stock");
        const data = await res.json();
        setStores(data);
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const getStockIcon = (stock) => {
    if (stock > 10) return <TrendingUp className="w-4 h-4" />;
    if (stock > 5) return <Package className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getStockColor = (stock) => {
    if (stock > 10) return 'from-emerald-500 to-green-600';
    if (stock > 5) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-pink-600';
  };

  const getStockStatus = (stock) => {
    if (stock > 10) return { status: 'สต็อกดี', color: 'text-emerald-600' };
    if (stock > 5) return { status: 'สต็อกต่ำ', color: 'text-amber-600' };
    return { status: 'สต็อกหมด', color: 'text-red-600' };
  };

  // Calculate summary statistics
  const totalStores = stores.length;
  const totalProducts = stores.reduce((acc, store) => acc + store.storeStocks.length, 0);
  const lowStockProducts = stores.reduce((acc, store) => 
    acc + store.storeStocks.filter(stock => stock.stock <= 5).length, 0
  );
  const totalValue = stores.reduce((acc, store) => 
    acc + store.storeStocks.reduce((sum, stock) => sum + (stock.stock * stock.product.price), 0), 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">ร้านค้าทั้งหมด</p>
              <p className="text-2xl font-bold text-slate-800">{totalStores}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">สินค้าทั้งหมด</p>
              <p className="text-2xl font-bold text-slate-800">{totalProducts}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">สินค้าสต็อกต่ำ</p>
              <p className="text-2xl font-bold text-red-600">{lowStockProducts}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">มูลค่าสต็อก</p>
              <p className="text-2xl font-bold text-slate-800">฿{totalValue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">รายงานสต็อกสินค้า</h1>
          <p className="text-slate-600 mt-1">ตรวจสอบสถานะสินค้าคงคลังของทุกร้าน</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span>สต็อกดี</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span>สต็อกต่ำ</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>สต็อกหมด</span>
          </div>
        </div>
      </div>
        
      {/* Stores Grid */}
      {stores.length > 0 ? (
        <div className="space-y-6">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Store Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{store.name}</h2>
                      <p className="text-slate-300 text-sm">สินค้าทั้งหมด {store.storeStocks.length} รายการ</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm">สต็อกต่ำ</p>
                    <p className="text-red-300 font-bold text-lg">
                      {store.storeStocks.filter(stock => stock.stock <= 5).length} รายการ
                    </p>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {store.storeStocks.map((stock) => {
                    const stockStatus = getStockStatus(stock.stock);
                    return (
                      <div key={stock.id} className="group bg-slate-50 hover:bg-slate-100 p-4 rounded-lg border border-slate-200 transition-all duration-200">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-800 truncate">{stock.product.name}</h3>
                            <p className="text-sm text-slate-600 truncate">{stock.product.owner}</p>
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            <div className={`relative overflow-hidden px-3 py-1 rounded-lg text-white font-semibold text-sm`}>
                              <div className={`absolute inset-0 bg-gradient-to-r ${getStockColor(stock.stock)}`} />
                              <div className="relative flex items-center space-x-1">
                                {getStockIcon(stock.stock)}
                                <span>{stock.stock}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">สถานะ</span>
                            <span className={`font-semibold ${stockStatus.color}`}>
                              {stockStatus.status}
                            </span>
                          </div>
                          
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${getStockColor(stock.stock)} transition-all duration-500`}
                              style={{ width: `${Math.min((stock.stock / 20) * 100, 100)}%` }}
                            />
                          </div>
                          
                          <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                            <span className="text-sm text-slate-600">ราคา/หน่วย</span>
                            <span className="font-bold text-slate-800">฿{stock.product.price.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs text-slate-500">
                            <span>มูลค่ารวม</span>
                            <span className="font-semibold">฿{(stock.stock * stock.product.price).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">ไม่พบข้อมูลร้านค้า</h3>
            <p className="text-slate-600 mb-6">ยังไม่มีร้านค้าในระบบ หรือไม่สามารถโหลดข้อมูลได้</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              รีโหลดข้อมูล
            </button>
          </div>
        </div>
      )}
    </div>
  );
}