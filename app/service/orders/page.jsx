'use client'
import React, { useState, useEffect } from 'react'
import { Loader2, Check, X, Clock, Calendar, User, Mail, MessageSquare, Phone, MessageCircle } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'

const ServiceOrdersPage = () => {
    const { isLoaded, isSignedIn } = useUser()
    const [appointments, setAppointments] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (isLoaded && isSignedIn) fetchAppointments()
    }, [isLoaded, isSignedIn])

    const fetchAppointments = async () => {
        try {
            const res = await fetch('/api/service/orders')
            if (res.ok) {
                const data = await res.json()
                setAppointments(data)
            } else {
                toast.error("Failed to fetch appointments")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch('/api/service/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            })

            if (res.ok) {
                toast.success(`Appointment ${status}`)
                fetchAppointments()
            } else {
                toast.error("Failed to update status")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        }
    }

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-400" size={40} />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Appointments</h1>

            {appointments.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                    <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No appointments yet</h3>
                    <p className="text-slate-500">When customers book your service, they will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                        apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {apt.status}
                                    </span>
                                    <span className="text-slate-400 text-sm flex items-center gap-1">
                                        <Clock size={14} />
                                        {new Date(apt.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                        <User size={18} className="text-slate-400" />
                                        {apt.customerName}
                                    </h3>
                                    <div className="space-y-1.5 mt-1">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Mail size={14} />
                                            {apt.customerEmail}
                                        </div>
                                        {apt.phone && (
                                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                <Phone size={14} />
                                                <a href={`tel:${apt.phone}`} className="hover:text-slate-800 transition-colors font-medium">{apt.phone}</a>
                                            </div>
                                        )}
                                        {apt.whatsapp && (
                                            <div className="flex items-center gap-2 text-green-600 text-sm">
                                                <MessageCircle size={14} />
                                                <a 
                                                    href={`https://wa.me/${apt.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello, I am contacting you from Bopstore Services regarding your appointment.")}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline font-medium hover:text-green-700 transition-colors"
                                                >
                                                    Chat on WhatsApp
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-slate-700 font-medium bg-slate-50 px-3 py-2 rounded-lg w-fit">
                                    <Calendar size={16} className="text-slate-500" />
                                    {new Date(apt.date).toLocaleString()}
                                </div>

                                {apt.notes && (
                                    <div className="flex items-start gap-2 text-slate-600 text-sm bg-slate-50 p-3 rounded-lg">
                                        <MessageSquare size={16} className="shrink-0 mt-0.5 text-slate-400" />
                                        <p>{apt.notes}</p>
                                    </div>
                                )}
                            </div>

                            {apt.status === 'pending' && (
                                <div className="flex md:flex-col gap-3 justify-center">
                                    <button 
                                        onClick={() => updateStatus(apt.id, 'confirmed')}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <Check size={16} /> Confirm
                                    </button>
                                    <button 
                                        onClick={() => updateStatus(apt.id, 'cancelled')}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
                                    >
                                        <X size={16} /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ServiceOrdersPage