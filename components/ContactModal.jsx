'use client'
import React from 'react'
import { X, Phone, MessageCircle } from 'lucide-react'

const ContactModal = ({ isOpen, onClose, service }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Contact {service.name}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    {service.whatsappNumber && (
                        <a 
                            href={`https://wa.me/${service.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all group"
                        >
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MessageCircle size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">WhatsApp</p>
                                <p className="text-sm text-slate-500">Chat directly with provider</p>
                            </div>
                        </a>
                    )}

                    <a href={`tel:${service.contact}`} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Phone size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">Phone Call</p>
                            <p className="text-sm text-slate-500">{service.contact}</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default ContactModal