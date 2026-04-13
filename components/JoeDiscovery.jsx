'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Search, MapPin, Calendar, ArrowRight } from 'lucide-react'
import Container from '@/components/Container'
import { useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'

const OgeDiscovery = () => {
    const { isSignedIn } = useUser()
    const features = [
        {
            icon: Search,
            title: "Smart Product Search",
            description: "Describe what you need or upload an image. Oge finds it in our inventory or suggests nearby vendors."
        },
        {
            icon: MapPin,
            title: "Nearby Services",
            description: "Need a tailor or a mechanic? Oge uses your location to find the best rated professionals near you."
        },
        {
            icon: Calendar,
            title: "Instant Booking",
            description: "Found a service? Oge can handle the booking for you in seconds. No more back-and-forth calls."
        }
    ]

    return (
        <section className="py-20 bg-white overflow-hidden">
            <Container>
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Text Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold uppercase tracking-wider">
                            <Sparkles size={16} />
                            AI Powered Concierge
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                            Meet Oge, your personal <span className="text-green-600">Bopstore Assistant</span>
                        </h2>
                        
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Experience the future of shopping and service discovery. Oge understands your needs, 
                            finds the best deals, and organizes your life—all through a simple chat.
                        </p>

                        <div className="grid grid-cols-1 gap-6 pt-4">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-green-600 border border-slate-100">
                                        <feature.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{feature.title}</h3>
                                        <p className="text-slate-500 text-sm">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            className="mt-8 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all flex items-center gap-2 group shadow-xl shadow-slate-200"
                            onClick={() => {
                            if (!isSignedIn) {
                                toast.error("Please sign in to use Oge Assistant")
                                return
                            }
                                // Dispatch a custom event to open the OgeChatWidget
                                window.dispatchEvent(new CustomEvent('open-oge-chat'));
                            }}
                        >
                            Start Chatting with Oge
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>

                    {/* Visual Element / Phone Mockup */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="flex-1 relative"
                    >
                        <div className="relative z-10 bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl border-8 border-slate-800 aspect-[4/5] max-w-sm mx-auto overflow-hidden">
                             {/* Phone Screen Content Mockup */}
                             <div className="h-full bg-white rounded-[1.5rem] p-6 space-y-4 flex flex-col">
                                <div className="flex items-center gap-3 border-b pb-4">
                                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">O</div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Oge Assistant</p>
                                        <p className="text-[10px] text-green-500 font-medium">Online & Ready to help</p>
                                    </div>
                                </div>
                                
                                <div className="flex-1 space-y-3">
                                    <div className="max-w-[80%] bg-slate-100 p-3 rounded-2xl rounded-tl-none text-xs text-slate-700">
                                        Hi! I'm Oge. How can I help you today?
                                    </div>
                                    <div className="max-w-[80%] ml-auto bg-green-500 p-3 rounded-2xl rounded-tr-none text-xs text-white">
                                        I need a tailor near me for a wedding suit.
                                    </div>
                                    <div className="max-w-[80%] bg-slate-100 p-3 rounded-2xl rounded-tl-none text-xs text-slate-700">
                                        I found 3 tailors within 2km of your location. Would you like to book an appointment?
                                    </div>
                                </div>

                                <div className="pt-2">
                                   <div className="h-10 bg-slate-50 rounded-full border border-slate-100 px-4 flex items-center justify-between">
                                      <span className="text-[10px] text-slate-400">Ask Oge anything...</span>
                                      <Sparkles size={14} className="text-green-500" />
                                   </div>
                                </div>
                             </div>
                        </div>
                        {/* Background decorative elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-200 rounded-full blur-3xl opacity-30" />
                        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-200 rounded-full blur-3xl opacity-30" />
                    </motion.div>
                </div>
            </Container>
        </section>
    )
}

export default OgeDiscovery