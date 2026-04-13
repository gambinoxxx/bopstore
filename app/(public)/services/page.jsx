'use client'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scissors, Wrench, Utensils, Hammer, Star, MapPin, MessageSquare, Search, Filter, SprayCan, Droplet, Plus, Loader2, LayoutDashboard, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Container from '@/components/Container'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'

const ServicesPage = () => {
    const router = useRouter()
    const [activeCategory, setActiveCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [providers, setProviders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isProvider, setIsProvider] = useState(false)
    const { isSignedIn } = useUser()
    const { getToken } = useAuth()
    
    const isFirstRun = useRef(true)

    const categories = [
        { id: 'all', name: 'All', icon: Filter },
        { id: 'tailor', name: 'Tailoring', icon: Scissors },
        { id: 'mechanic', name: 'Mechanic', icon: Wrench },
        { id: 'food', name: 'Food Vendors', icon: Utensils },
        { id: 'carpenter', name: 'Carpentry', icon: Hammer },
        { id: 'cleaning', name: 'Cleaning', icon: SprayCan },
        { id: 'plumbing', name: 'Plumbing', icon: Droplet },
    ]

    useEffect(() => {
        const fetchProviders = async () => {
            setIsLoading(true)
            try {
                const params = new URLSearchParams()
                if (activeCategory !== 'all') params.append('category', activeCategory)
                if (searchQuery) params.append('search', searchQuery)
                
                const res = await fetch(`/api/service?${params.toString()}`)
                const data = await res.json()
                setProviders(data)
            } catch (error) {
                console.error("Failed to fetch providers", error)
            } finally {
                setIsLoading(false)
            }
        }

        // 2026 Optimization: Immediate fetch on mount or category change
        // Only debounce when the user is actually typing a search query
        if (isFirstRun.current || !searchQuery) {
            fetchProviders()
            isFirstRun.current = false
        } else {
            const timeoutId = setTimeout(fetchProviders, 350)
            return () => clearTimeout(timeoutId)
        }
    }, [activeCategory, searchQuery])

    useEffect(() => {
        const checkProviderStatus = async () => {
            if (isSignedIn) {
                try {
                    const token = await getToken()
                    const res = await fetch('/api/service/is-provider', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    const data = await res.json()
                    setIsProvider(data.isProvider)
                } catch (error) {
                    console.error("Failed to check provider status", error)
                }
            }
        }
        checkProviderStatus()
    }, [isSignedIn, getToken])

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-20 selection:bg-green-100">
            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent opacity-50" />
                <Container>
                    <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-black tracking-tighter"
                        >
                            Service Discovery <span className="text-green-500">Reimagined.</span>
                        </motion.h1>
                        <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">Connect with top-tier professionals. Verified results, instant booking, and AI-powered matching.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mt-12">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-500 transition-colors" size={22} />
                                <input 
                                    type="text" 
                                    placeholder="What service do you need today?" 
                                    className="w-full pl-14 pr-32 py-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-lg font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button 
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-slate-900 text-sm font-black rounded-full transition-all shadow-lg shadow-green-500/20"
                                    onClick={() => {
                                        if (!isSignedIn) {
                                            toast.error("Please sign in to use Oge Assistant")
                                            return
                                        }
                                        // Dispatch a custom event to open the OgeChatWidget with the current search query
                                        window.dispatchEvent(new CustomEvent('open-oge-chat', { detail: { query: searchQuery } }));
                                    }}
                                >
                                    <Sparkles size={14} />
                                    Ask Oge
                                </button>
                            </div>
                            {isProvider ? (
                                <Link href="/service" className="flex items-center justify-center gap-2 px-8 py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-[2rem] transition-all whitespace-nowrap backdrop-blur-sm border border-white/10">
                                    <LayoutDashboard size={20} />
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href="/services/create" className="flex items-center justify-center gap-2 px-8 py-5 bg-white text-slate-900 font-black rounded-[2rem] hover:bg-slate-100 transition-all whitespace-nowrap shadow-xl">
                                    <Plus size={20} />
                                    Register Service
                                </Link>
                            )}
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="py-12">
                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-3 mb-16">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-black transition-all ${
                                activeCategory === cat.id 
                                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200 -translate-y-1' 
                                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                            }`}
                        >
                            <cat.icon size={18} />
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Providers Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-slate-400" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {providers.map((provider, idx) => {
                            // PRO 2026 Standard: Rely on API-calculated aggregate fields.
                            // Fallback to client-side calculation from review data
                            const reviews = provider.reviews || [];
                            const ratingValue = reviews.length > 0 
                                ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length 
                                : 0;
                            const totalReviews = reviews.length;

                            return (
                                <motion.div 
                                    key={provider.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    viewport={{ once: true }}
                                    className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 group flex flex-col"
                                >
                                    {/* Image */}
                                    <div className="h-64 bg-slate-100 relative overflow-hidden">
                                        <Image 
                                            src={provider.logo || "https://via.placeholder.com/400x300?text=No+Image"} 
                                            alt={provider.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-5 right-5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-2xl text-[10px] font-black text-slate-900 flex items-center gap-1.5 shadow-sm border border-white/50 uppercase tracking-tighter">
                                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                            {ratingValue > 0 ? ratingValue.toFixed(1) : 'New'} ({totalReviews})
                                        </div>
                                        <div className="absolute bottom-4 left-5 bg-slate-900/40 backdrop-blur text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">
                                            {provider.category}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="mb-6">
                                            <div>
                                                <div className="flex items-center gap-2.5">
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight group-hover:text-green-600 transition-colors">{provider.name}</h3>
                                                    <ShieldCheck className="text-green-500 shrink-0" size={18} />
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-2 font-medium">
                                                    <MapPin size={14} className="shrink-0" />
                                                    <span className="truncate max-w-[150px]">{provider.address}</span>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] rounded-lg font-black uppercase tracking-widest whitespace-nowrap">
                                                {provider.category}
                                            </span>
                                        </div>

                                        {/* Review Snippet */}
                                        <div className="bg-slate-50 p-5 rounded-2xl mb-8 flex-1 border border-slate-100/50 min-h-[120px] flex flex-col justify-center">
                                            {provider.reviews?.length > 0 ? (
                                                <div className="space-y-3">
                                                    {provider.reviews.slice(0, 2).map((rev) => (
                                                        <div key={rev.id} className="flex flex-col gap-1 border-b border-slate-200 last:border-0 pb-2 last:pb-0">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{rev.user}</span>
                                                                <div className="flex items-center gap-0.5">
                                                                    <Star size={8} className="text-yellow-500 fill-yellow-500" />
                                                                    <span className="text-[8px] font-bold text-slate-600">{rev.rating.toFixed(1)}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-slate-600 text-xs italic leading-relaxed line-clamp-1">"{rev.comment}"</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2 text-slate-400 py-2">
                                                    <MessageSquare size={18} />
                                                    <p className="text-xs italic">No reviews yet</p>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => {
                                                if (!isSignedIn) {
                                                    toast.error("Please sign in to view provider profiles")
                                                    return
                                                }
                                                router.push(`/services/${provider.id}`)
                                            }}
                                            className="group/btn w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-2xl shadow-slate-200"
                                        >
                                            View Profile
                                            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {!isLoading && providers.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-lg">No service providers found matching your criteria.</p>
                        <button 
                            onClick={() => {setActiveCategory('all'); setSearchQuery('')}}
                            className="mt-4 text-green-600 font-medium hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </Container>
        </div>
    )
}

export default ServicesPage