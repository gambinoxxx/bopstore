'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, Image as ImageIcon, Loader2, User, MapPin, ShoppingBag, Calendar } from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/lib/formatPrice'
import { useDispatch } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'

const OgeChatWidget = () => {
    const dispatch = useDispatch()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm Oge, your Bopstore assistant. I can help you find products, discover nearby services, or book appointments. What's on your mind?" }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [location, setLocation] = useState(null)
    const scrollRef = useRef(null)
    const fileInputRef = useRef(null)

    // 1. Listen for open events from Discovery section or Search bar
    useEffect(() => {
        const handleOpen = (e) => {
            setIsOpen(true)
            if (e.detail?.query) {
                handleSendMessage(e.detail.query)
            }
        }
        window.addEventListener('open-oge-chat', handleOpen)
        return () => window.removeEventListener('open-oge-chat', handleOpen)
    }, [])

    // 2. Get user location on mount for "near me" accuracy
    const requestLocation = () => {
        return new Promise((resolve) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                        setLocation(loc);
                        resolve(loc);
                    },
                    () => resolve(null),
                    { enableHighAccuracy: true, timeout: 5000 }
                );
            } else {
                resolve(null);
            }
        });
    };

    // 3. Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, [messages, isLoading])

    const handleSendMessage = async (textOverride) => {
        const content = textOverride || input
        if (!content.trim()) return

        const userMessage = { role: 'user', content }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        // Ensure we try to get location on user gesture for mobile compatibility
        const currentLoc = location || await requestLocation();

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
                onClick={() => setIsOpen(true)}
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
                                        
                                        {/* Product Results */}
                                        {msg.products && (
                                            <div className="mt-3 space-y-2">
                                                {msg.products.map(p => (
                                                    <div key={p.id} className="flex gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                        {p.image && <div className="w-12 h-12 relative rounded-md overflow-hidden shrink-0"><Image src={p.image} alt={p.name} fill className="object-cover" /></div>}
                                                        <div className="overflow-hidden">
                                                            <p className="font-bold text-xs truncate">{p.name}</p>
                                                            <p className="text-green-600 text-[10px] font-bold">{formatPrice(p.price)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Service Results */}
                                        {msg.services && (
                                            <div className="mt-3 space-y-2">
                                                {msg.services.map(s => (
                                                    <div key={s.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                        <p className="font-bold text-xs">{s.name}</p>
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                                                            <MapPin size={10} /> {s.address}
                                                        </div>
                                                        <button 
                                                            onClick={() => handleSendMessage(`Book appointment with ${s.name} (ID: ${s.id})`)}
                                                            className="mt-2 w-full py-1.5 bg-slate-900 text-white text-[10px] rounded-md font-bold"
                                                        >
                                                            Book Now
                                                        </button>
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
