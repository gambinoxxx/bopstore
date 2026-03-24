'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import Loading from "@/components/Loading";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";

export default function Product() {

    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const products = useSelector(state => state.product.list);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);

            // Helper to check if a product is a service offering
            const isServiceProduct = (p) => {
                return p?.images?.some(img => img.includes('service-products'));
            };

            // First, try to find the product in the Redux store
            let foundProduct = products.find((p) => p.id === productId);

            // If found in Redux but it's a service product, invalidate it
            if (isServiceProduct(foundProduct)) {
                foundProduct = null;
            }

            // If not found in Redux, fetch from the API as a fallback
            if (!foundProduct && productId) {
                try {
                    const { data } = await axios.get(`/api/products/${productId}`);
                    // If the product exists but is archived, store inactive, or is a service product, treat as not found.
                    if (data.product && (data.product.isArchived || !data.product.store.isActive || isServiceProduct(data.product))) {
                        foundProduct = null; // Explicitly set to null so the "Not Found" message shows.
                    } else {
                        foundProduct = data.product;
                    }
                } catch (error) {
                    // If the API returns a 404, it means the product doesn't exist.
                    // We can log this without showing an error toast to the user.
                    if (error.response && error.response.status === 404) {
                        console.log("Product not found via API.");
                    } else {
                        toast.error("Something went wrong. Please try again.");
                        console.error("Failed to fetch product:", error);
                    }
                }
            }
            setProduct(foundProduct || null); // Ensure we set state to null if product is not found
            setLoading(false);
            scrollTo(0, 0);
        };

        fetchProduct();
    }, [productId, products]);

    if (loading) return <Loading />;
    if (!product) return <div className="min-h-[70vh] flex items-center justify-center text-2xl text-slate-400">Product not found.</div>;

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category}
                </div>

                {/* Product Details */}
                <ProductDetails product={product} />

                {/* Description & Reviews */}
                <ProductDescription product={product} />
            </div>
        </div>
    );
}