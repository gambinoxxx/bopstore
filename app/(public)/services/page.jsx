'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Scissors, Wrench, Utensils, Hammer, Star, MapPin, MessageSquare, Search, Filter, SprayCan, Droplet, Plus, Loader2, LayoutDashboard, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Container from '@/components/Container'
import { useUser, useAuth } from '@clerk/nextjs'

const ServicesPage = () => {
    const [activeCategory, setActiveCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [providers, setProviders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isProvider, setIsProvider] = useState(false)
    const { isSignedIn } = useUser()
    const { getToken } = useAuth()

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

        const timeoutId = setTimeout(() => {
            fetchProviders()
        }, 300)

        return () => clearTimeout(timeoutId)
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
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-16">
                <Container>
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h1 className="text-4xl md:text-5xl font-bold">Find Trusted Service Providers</h1>
                        <p className="text-slate-300 text-lg">Connect with skilled professionals for all your needs, from tailoring to mechanics.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mt-8">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search for services or location..." 
                                    className="w-full pl-12 pr-28 py-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button 
                                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-slate-900 text-xs font-bold rounded-full transition-all"
                                    onClick={() => {
                                        // Dispatch a custom event to open the OgeChatWidget with the current search query
                                        window.dispatchEvent(new CustomEvent('open-oge-chat', { detail: { query: searchQuery } }));
                                    }}
                                >
                                    <Sparkles size={14} />
                                    Ask Oge
                                </button>
                            </div>
                            {isProvider ? (
                                <Link href="/service" className="flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-colors whitespace-nowrap backdrop-blur-sm border border-white/20">
                                    <LayoutDashboard size={20} />
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href="/services/create" className="flex items-center justify-center gap-2 px-6 py-4 bg-green-500 hover:bg-green-600 text-slate-900 font-bold rounded-full transition-colors whitespace-nowrap">
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
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
                                activeCategory === cat.id 
                                    ? 'bg-slate-900 text-white shadow-lg scale-105' 
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {providers.map((provider) => (
                            <motion.div 
                                key={provider.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 group"
                            >
                                {/* Image */}
                                <div className="h-48 bg-slate-200 relative overflow-hidden">
                                    <img 
                                        src={provider.logo || "https://via.placeholder.com/400x300?text=No+Image"} 
                                        alt={provider.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-slate-800 flex items-center gap-1">
                                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                        {provider.rating ? provider.rating.toFixed(1) : 'New'} ({provider.reviews?.length || 0})
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">{provider.name}</h3>
                                            <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                                                <MapPin size={14} />
                                                {provider.address}
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium capitalize">
                                            {provider.category}
                                        </span>
                                    </div>

                                    {/* Review Snippet */}
                                    <div className="bg-slate-50 p-4 rounded-xl mb-6 min-h-[100px]">
                                        <div className="flex items-start gap-3">
                                            <MessageSquare size={16} className="text-slate-400 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-slate-600 text-sm italic line-clamp-2">"{provider.reviews?.[0]?.comment || "No reviews yet"}"</p>
                                                {provider.reviews?.[0] && (
                                                    <p className="text-slate-400 text-xs mt-2 font-medium">— {provider.reviews[0].user}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Link href={`/services/${provider.id}`} className="block w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors active:scale-95 text-center">
                                        View Profile
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
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