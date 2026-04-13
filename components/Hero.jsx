'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon, Trophy, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const Hero = () => {

    const rotatingImages = [
        assets.img1,
        assets.img2,
        assets.img3,
        assets.img4,
        assets.img5,
        assets.img7,
    ];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % rotatingImages.length);
        }, 4000); // Change image every 4 seconds
        return () => clearInterval(interval); // Clear interval on component unmount
    }, [rotatingImages.length]);

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

    const [topVendors, setTopVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendorRankings = async () => {
            try {
                const { data } = await axios.get('/api/vendor-ranking');
                if (data.rankings && data.rankings.length > 0) {
                    const styles = [
                        { medal: '🥇', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
                        { medal: '🥈', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
                        { medal: '🥉', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
                    ];

                    const mappedVendors = data.rankings
                        .sort((a, b) => a.rank - b.rank)
                        .slice(0, 3)
                        .map((vendor, index) => ({
                            name: vendor.name,
                            deals: vendor.deals,
                            username: vendor.username,
                            ...styles[index]
                        }));
                    
                    if (mappedVendors.length > 0) {
                        setTopVendors(mappedVendors);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch vendor rankings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendorRankings();
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className='mx-6'
        >
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10 min-h-[500px]'>
                {/* Main Hero Card: 2026 Premium Mesh Gradient */}
                <div className='relative flex-1 flex flex-col bg-gradient-to-br from-[#E2FFD1] via-[#B9F8CF] to-[#96FFC1] rounded-[2.5rem] xl:min-h-100 overflow-hidden group shadow-2xl shadow-green-100/50'>
                    <div className='p-8 sm:p-20 relative z-10'>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className='inline-flex items-center gap-3 bg-green-300 text-green-600 pr-4 p-1 rounded-full text-xs sm:text-sm font-bold'
                        >
                            <span className='bg-green-600 px-3 py-1 rounded-full text-white text-xs font-black uppercase tracking-wider'>News</span> 
                            Free Shipping on Orders Above {currency}200k! 
                            <ChevronRightIcon className='group-hover:ml-2 transition-all' size={16} />
                        </motion.div>
                        
                        <h2 className='text-4xl sm:text-6xl leading-[1.1] my-6 font-medium bg-gradient-to-r from-slate-600 to-[#A0FF74] bg-clip-text text-transparent tracking-tighter max-w-xs sm:max-w-md'>
                            Everything You Need. Value You Deserve.
                        </h2>

                        <div className='flex items-baseline gap-2 mt-4 sm:mt-8'>
                            <p className='text-slate-500 font-bold uppercase tracking-widest text-[10px]'>Starts from</p>
                            <p className='text-4xl font-black text-slate-900'>{currency}2,500</p>
                        </div>

                        <Link href='/shop' className='inline-flex items-center gap-3 bg-slate-900 text-white text-sm font-black py-4 px-10 mt-10 rounded-2xl hover:bg-slate-800 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all group/btn'>
                            LEARN MORE
                            <ArrowRightIcon size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Carousel Container */}
                    <div className='absolute bottom-0 right-0 md:right-10 w-full sm:w-auto h-[18rem] sm:h-auto z-0 flex items-end justify-end'>
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={currentImageIndex}
                                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                                transition={{ duration: 0.6, ease: "circOut" }}
                                className='relative w-full h-full p-8 sm:p-0 flex items-end justify-end'
                            >
                                <Image 
                                    className='w-4/5 h-48 object-contain sm:object-cover sm:h-auto sm:w-auto sm:max-w-[17rem] drop-shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]' 
                                    src={rotatingImages[currentImageIndex]} 
                                    alt="Hero Image" 
                                    priority
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sidebar Orchestration */}
                <div className='flex flex-col md:flex-row xl:flex-col gap-6 w-full xl:max-w-sm'>
                    {/* Leaderboard Card */}
                    <div className='flex-1 flex flex-col bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 group'>
                        <div className='flex items-center justify-between mb-6'>
                            <div className='flex items-center gap-2'>
                                <h3 className='text-xl font-black text-slate-900 tracking-tight'>Top Vendors</h3>
                                <Sparkles className="text-green-500" size={18} />
                            </div>
                            <Trophy className="text-yellow-500 animate-bounce" size={24} />
                        </div>
                        <div className='space-y-4 w-full'>
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 animate-pulse">
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="h-8 w-8 bg-slate-200 rounded-full shrink-0"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                topVendors.map((vendor, index) => (
                                <Link href={vendor.username ? `/shop/${vendor.username}` : '#'} key={index} className={`flex items-center justify-between p-4 rounded-2xl border ${vendor.bg} ${vendor.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
                                    <div className='flex items-center gap-3'>
                                        <span className='text-2xl'>{vendor.medal}</span>
                                        <div>
                                            <p className='font-black text-slate-900 text-sm'>{vendor.name}</p>
                                            <p className='text-[10px] text-slate-500 font-bold uppercase tracking-wider'>{vendor.deals} Deals</p>
                                        </div>
                                    </div>
                                    <div className={`font-black text-lg ${vendor.color}`}>#{index + 1}</div>
                                </Link>
                            )))}
                        </div>
                    </div>

                    {/* Discount Action Card */}
                    <Link href='/shop' className='flex-1 flex items-center justify-between w-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-blue-200'>
                        <div className='relative z-10'>
                            <p className='text-4xl font-black tracking-tighter leading-none mb-2'>20% <br/> OFF</p>
                            <p className='text-[10px] font-black uppercase tracking-[0.2em] opacity-80'>Weekend Promo</p>
                            <p className='flex items-center gap-2 mt-6 text-sm font-bold'>
                                View more 
                                <ArrowRightIcon className='group-hover:translate-x-2 transition-all' size={18} /> 
                            </p>
                        </div>
                        <div className='absolute -right-4 -bottom-4 w-40 opacity-20 group-hover:scale-110 transition-transform duration-700'>
                            <Image className='w-full rotate-[-15deg]' src={assets.img10} alt="" />
                        </div>
                        {/* Glass Overlay Effect */}
                        <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16' />
                    </Link>
                </div>
            </div>
            <CategoriesMarquee />
        </motion.div>

    )
}

export default Hero
