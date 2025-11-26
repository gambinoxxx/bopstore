'use client'

import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";

const ProductDetails = ({ product }) => {

    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦';

    const isOutOfStock = product.stock === 0;
    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();

    const router = useRouter()

    const [mainImage, setMainImage] = useState(product.images[0]);

    const addToCartHandler = () => {
        dispatch(addToCart({ productId }))
    }

    const averageRating = product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            {/* --- IMAGE GALLERY --- */}
            <div>
                {/* Main Image Display */}
                <div className="w-full h-[314px] md:h-[441px] relative mb-4 border rounded-lg shadow-sm overflow-hidden p-4 bg-slate-50">
                    <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                </div>

                {/* Thumbnail Selector */}
                <div className="flex gap-3">
                    {product.images.map((image, index) => (
                        <div
                            key={index}
                            onClick={() => setMainImage(product.images[index])}
                            className={`w-20 h-20 relative rounded-md cursor-pointer border-2 transition-all ${mainImage === image ? 'border-slate-800' : 'border-slate-200 hover:border-slate-400'}`}
                        >
                            <Image
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-contain"
                                sizes="5rem"
                            />
                        </div>
                    ))}
                </div>
            </div>
            {/* --- PRODUCT INFORMATION --- */}
            <div className="flex-1 flex flex-col">
                <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{product.rating.length} Reviews</p>
                </div>
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p> {currency}{product.price} </p>
                    <p className="text-xl text-slate-500 line-through">{currency}{product.mrp}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <TagIcon size={14} />
                    <p>Save {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}% right now</p>
                </div>
                <div className="my-4">
                    {isOutOfStock ? (
                        <p className="font-semibold text-red-500">Out of Stock</p>
                    ) : (
                        <p className="font-semibold text-green-600">In Stock: {product.stock} available</p>
                    )}
                </div>
                <div className="flex items-end gap-5 mt-10">
                    {
                        cart[productId] && !isOutOfStock && (
                            <div className="flex flex-col gap-3">
                                <p className="text-lg text-slate-800 font-semibold">Quantity</p>
                                <Counter productId={productId} stock={product.stock} />
                            </div>
                        )
                    }
                    <button
                        onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')}
                        disabled={isOutOfStock && !cart[productId]}
                        className="bg-slate-800 text-white px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isOutOfStock && !cart[productId] ? 'Out of Stock' : (!cart[productId] ? 'Add to Cart' : 'View Cart')}
                    </button>
                </div>
                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" /> Shipping worldwide </p>
                    <p className="flex gap-3"> <CreditCardIcon className="text-slate-400" /> 100% Secured Payment </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" /> Trusted by top brands </p>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails