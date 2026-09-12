import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";

type DigitalProductSummary = {
  id: string;
  title: string;
  category: string;
  price: number;
  status: string;
  is_featured: boolean;
  created_at: string;
};

export default function DigitalProductsList() {
  const [products, setProducts] = useState<DigitalProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('digital_products')
        .select('id, title, category, price, status, is_featured, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data as DigitalProductSummary[]);
      }
    } catch (e) {
      console.error("Error fetching products:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    const { error } = await supabase.from('digital_products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    } else {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Digital Products</h2>
          <p className="text-muted-foreground">Manage your resources, tools, and digital downloads.</p>
        </div>
        <Link to="/admin/digital-products/new">
          <Button><Plus className="w-4 h-4 mr-2" /> Create Product</Button>
        </Link>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-900 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-900">Loading products...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-900">No products found. Create your first digital product!</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      {product.title}
                      {product.is_featured && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">FEATURED</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">₹{product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {product.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900">
                    {product.created_at ? format(new Date(product.created_at), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/digital-products/${product.id}`}>
                        <Button variant="outline" size="sm"><Edit2 className="w-4 h-4" /></Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => deleteProduct(product.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
