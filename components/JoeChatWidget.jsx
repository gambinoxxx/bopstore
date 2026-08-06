'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, Image as ImageIcon, Loader2, User, MapPin, ShoppingBag, Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/formatPrice'
import { useDispatch } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'

const OgeChatWidget = () => {
    const dispatch = useDispatch()
    const { isSignedIn } = useUser()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm Oge, your Bopstore assistant. I can help you find products, discover nearby services, or book appointments. What's on your mind?" }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [location, setLocation] = useState(null)
    const [locationStatus, setLocationStatus] = useState('idle')
    const scrollRef = useRef(null)
    const fileInputRef = useRef(null)

    // 1. Listen for open events from Discovery section or Search bar
    useEffect(() => {
        const handleOpen = (e) => {
            if (!isSignedIn) return
            setIsOpen(true)
            if (e.detail?.query) {
                handleSendMessage(e.detail.query)
            }
        }
        window.addEventListener('open-oge-chat', handleOpen)
        return () => window.removeEventListener('open-oge-chat', handleOpen)
    }, [isSignedIn])

    // 2. Request location only for nearby searches, and make the result visible.
    const requestLocation = () => {
        return new Promise((resolve) => {
            if ("geolocation" in navigator) {
                setLocationStatus('requesting')
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                        setLocation(loc);
                        setLocationStatus('available')
                        resolve(loc);
                    },
                    (err) => {
                        console.warn("Location error:", err);
                        setLocationStatus(err.code === 1 ? 'denied' : 'unavailable')
                        resolve(null);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
                );
            } else {
                setLocationStatus('unavailable')
                resolve(null);
            }
        });
    };

    // 3. Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, [messages, isLoading])

    const handleSendMessage = async (textOverride, locationOverride = null) => {
        const content = textOverride || input
        if (!content.trim()) return

        const userMessage = { role: 'user', content }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        const needsNearbyLocation = /\b(around me|near me|nearby|closest)\b/i.test(content)
        const currentLoc = locationOverride || (needsNearbyLocation ? location || await requestLocation() : null)

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: content,
                    history: messages.map(m => {
                        let textContent = m.content;
                        // If it's an assistant message with products, inject the details into the history text
                        if (!textContent && m.products) {
                            textContent = `${m.message}\nProducts found:\n${m.products.map(p => `- ${p.name} (ID: ${p.id})`).join('\n')}`;
                        } else if (!textContent && m.services) {
                            textContent = `${m.message}\nServices found:\n${m.services.map(s => `- ${s.name} (ID: ${s.id})`).join('\n')}`;
                        } else if (!textContent && m.message) {
                            textContent = m.message;
                        }
                        return { role: m.role, content: textContent || "" };
                    }),
                    ...(currentLoc || {})
                })
            })
            const data = await response.json()
            
            setMessages(prev => [...prev, { role: 'assistant', ...data }])

            // Trigger Redux action if item was added to cart via AI
            if (data.intent === 'add_to_cart' && data.status === 'success' && data.productId) {
                dispatch(addToCart({ productId: data.productId, quantity: data.quantity || 1 }))
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again." }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setMessages(prev => [...prev, { role: 'user', content: "Analyzing image...", isImage: true }])
        setIsLoading(true)

        const formData = new FormData()
        formData.append('image', file)

        try {
            const response = await fetch('/api/ai/analyze-image', {
                method: 'POST',
                body: formData
            })
            const data = await response.json()
            setMessages(prev => [...prev, { role: 'assistant', ...data }])
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Failed to analyze image." }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Floating FAB */}
            <button 
                onClick={() => {
                    if (!isSignedIn) {
                        toast.error("Please sign in to use Oge Assistant")
                        return
                    }
                    setIsOpen(true)
                }}
                className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 group"
            >
                <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-24 right-6 w-[90vw] max-w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-[60]"
                    >
                        {/* Header */}
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold">O</div>
                                <div>
                                    <h3 className="text-sm font-bold">Oge Assistant</h3>
                                    <p className="text-[10px] text-green-400">Online</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                                        msg.role === 'user' ? 'bg-green-500 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                    }`}>
                                        {/* Standardize rendering for both 'content' and 'message' keys */}
                                        {(msg.content || msg.message) && <p className="leading-relaxed">{msg.content || msg.message}</p>}

                                        {/* Location Request Button */}
                                        {msg.status === 'missing_location' && !location && (
                                            <button 
                                                onClick={async () => {
                                                    const loc = await requestLocation()
                                                    if (loc) {
                                                        handleSendMessage("Location access granted. Please proceed with my request.", loc)
                                                    }
                                                }}
                                                className="mt-3 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-green-100"
                                            >
                                                <MapPin size={16} />
                                                Enable Location Access
                                            </button>
                                        )}
                                        
                                        {/* Product Results */}
                                        {msg.products && (
                                            <div className="mt-3 space-y-2">
                                                {msg.products.map(p => (
                                                    <Link href={`/product/${p.id}`} key={p.id} className="flex gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors group">
                                                        {p.image && <div className="w-12 h-12 relative rounded-md overflow-hidden shrink-0"><Image src={p.image} alt={p.name} fill className="object-cover" /></div>}
                                                        <div className="overflow-hidden">
                                                            <p className="font-bold text-xs truncate group-hover:text-green-600 transition-colors">{p.name}</p>
                                                            <p className="text-green-600 text-[10px] font-bold">{formatPrice(p.price)}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {/* Service Results */}
                                        {msg.services && (
                                            <div className="mt-3 space-y-2">
                                                {msg.services.map(s => (
                                                    <div key={s.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex gap-3">
                                                        {s.logo && (
                                                            <div className="w-12 h-12 relative rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white">
                                                                <Image src={s.logo} alt={s.name} fill className="object-cover" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-xs truncate">{s.name}</p>
                                                            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 truncate">
                                                                <MapPin size={10} /> {s.address}
                                                            </div>
                                                            {s.distance && (
                                                                <p className="text-[10px] text-green-600 font-medium mt-0.5">{s.distance}</p>
                                                            )}
                                                            <div className="flex gap-2 mt-2">
                                                                <Link 
                                                                    href={`/services/${s.id}`}
                                                                    className="flex-1 py-1.5 bg-slate-200 text-slate-700 text-[10px] rounded-md font-bold text-center hover:bg-slate-300 transition-colors"
                                                                >
                                                                    View Profile
                                                                </Link>
                                                                <button 
                                                                    onClick={() => handleSendMessage(`Book appointment with ${s.name} (ID: ${s.id})`)}
                                                                    className="flex-1 py-1.5 bg-slate-900 text-white text-[10px] rounded-md font-bold hover:bg-slate-800 transition-colors"
                                                                >
                                                                    Book Now
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Intent Icons */}
                                        {msg.intent === 'book_appointment' && msg.status === 'success' && (
                                            <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-green-600">
                                                <Calendar size={12} /> Appointment Requested
                                            </div>
                                        )}

                                        {msg.intent === 'add_to_cart' && (
                                            <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-green-600">
                                                <ShoppingBag size={12} /> Ready for Cart
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-3 shadow-sm">
                                        <Loader2 className="animate-spin text-green-500" size={16} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            {locationStatus !== 'idle' && (
                                <p className={`mb-2 text-[10px] font-medium ${locationStatus === 'available' ? 'text-green-600' : locationStatus === 'requesting' ? 'text-slate-500' : 'text-amber-600'}`}>
                                    {locationStatus === 'available' && 'Location shared for nearby results.'}
                                    {locationStatus === 'requesting' && 'Getting your location…'}
                                    {locationStatus === 'denied' && 'Location permission was denied. You can still search by area.'}
                                    {locationStatus === 'unavailable' && 'Location is unavailable. You can still search by area.'}
                                </p>
                            )}
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => fileInputRef.current.click()}
                                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <ImageIcon size={20} />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask Oge anything..."
                                    className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                                <button 
                                    onClick={() => handleSendMessage()}
                                    disabled={!input.trim()}
                                    className="p-2 bg-slate-900 text-white rounded-xl disabled:opacity-50 transition-all active:scale-95"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default OgeChatWidget;
