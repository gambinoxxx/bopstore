'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import MobileSearch from "@/components/MobileSearch";
import PromoPopup from "@/components/PromoPopup"; // Import the new component
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { useAuth, useUser } from "@clerk/nextjs";
import WhatsAppWidget from "@/components/WhatsAppWidget"; // Import the new component
import { fetchCart, uploadCart } from "@/lib/features/cart/cartSlice";
import { fetchAddress } from "@/lib/features/address/addressSlice";
import { fetchUserRatings } from "@/lib/features/rating/ratingSlice";

export default function PublicLayout({ children }) {
    
    const {user} = useUser();
    const dispatch = useDispatch();
    const { getToken } = useAuth();

    const {cartItems} = useSelector((state)=>state.cart)

    useEffect(() => {
        // Always fetch the product list
        dispatch(fetchProducts({}))

        // If a user is logged in, fetch their data and sync the cart
        if (user) {
            dispatch(fetchCart({getToken}))
            dispatch(fetchAddress({getToken}))
            dispatch(fetchUserRatings({getToken}))
            dispatch(uploadCart({getToken}))
        }
        // This effect runs when the user logs in/out or when cartItems change for an authenticated user.
    }, [user, getToken, dispatch, cartItems]);

    return (
        <>
            <Banner />
            <Navbar />
            <MobileSearch />
            {children}
            <PromoPopup /> {/* Add the popup here */}
            <WhatsAppWidget /> {/* Add the widget here */}
            <Footer />
        </>
    );
}
