'use client'
import { Suspense, useState, useMemo, useEffect } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

// Import your new filter component
import CategoryFilter from "@/components/CategoryFilter";
import PriceRangeFilter from "@/components/PriceRangeFilter";

 function ShopContent() {

    // get query params ?search=abc
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const categoryFromUrl = searchParams.get('category');
    const router = useRouter()

    const allProducts = useSelector(state => state.product.list)

    // State for our new category filter
    const [selectedCategories, setSelectedCategories] = useState(categoryFromUrl ? [decodeURIComponent(categoryFromUrl)] : []);
    const [selectedPriceRange, setSelectedPriceRange] = useState(null);

    // This effect syncs the filter state when the URL changes.
    // This is what makes the link from the CategoriesMarquee work.
    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
            // Set the filter to only the category from the URL
            setSelectedCategories([decodeURIComponent(categoryFromUrl)]);
        }
    }, [searchParams]);

    // Memoize the filtered products to avoid re-calculating on every render
    const filteredProducts = useMemo(() => {
        return allProducts.filter(product => {
            // Match search query
            const searchMatch = search 
                ? product.name.toLowerCase().includes(search.toLowerCase()) 
                : true;

            // Match category filter
            const categoryMatch = selectedCategories.length > 0 
                ? selectedCategories.includes(product.category) 
                : true;

            // Match price range filter
            const priceMatch = selectedPriceRange
                ? product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max
                : true;

            return searchMatch && categoryMatch && priceMatch;
        });
    }, [allProducts, search, selectedCategories, selectedPriceRange]);

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                <h1 onClick={() => router.push('/shop')} className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"> {search && <MoveLeftIcon size={20} />}  All <span className="text-slate-700 font-medium">Products</span></h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* --- Filter Sidebar --- */}
                    <div className="md:col-span-1 space-y-6">
                        <CategoryFilter 
                            products={allProducts} 
                            selectedCategories={selectedCategories} 
                            setSelectedCategories={setSelectedCategories} 
                        />
                        <PriceRangeFilter 
                            setSelectedPriceRange={setSelectedPriceRange}
                        />
                    </div>

                    {/* --- Product Grid --- */}
                    <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-6 xl:gap-8 mb-32">
                        {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}