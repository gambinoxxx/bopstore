'use client'
import React, { useEffect, useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

const AdminServicesPage = () => {
    const [services, setServices] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/admin/approve-store?type=service')
            const data = await res.json()
            setServices(data.stores || [])
        } catch (error) {
            console.error(error)
            toast.error('Failed to fetch services')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchServices()
    }, [])

    const handleStatusUpdate = async (id, status) => {
        try {
            const res = await fetch(`/api/admin/approve-store`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId: id, status })
            })

            if (res.ok) {
                toast.success(`Service ${status} successfully`)
                fetchServices()
            } else {
                toast.error('Failed to update status')
            }
        } catch (error) {
            console.error(error)
            toast.error('An error occurred')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-slate-400" size={40} />
            </div>
        )
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Pending Service Approvals</h1>
            
            {services.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm text-center text-slate-500">
                    No pending services found.
                </div>
            ) : (
                <div className="grid gap-6">
                    {services.map((service) => (
                        <div key={service.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className="relative w-24 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                <Image src={service.logo || "https://via.placeholder.com/100"} alt={service.name} fill className="object-cover" />
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900">{service.name}</h3>
                                <p className="text-slate-500 text-sm mb-2">{service.category} • {service.address}</p>
                                <p className="text-slate-600 text-sm line-clamp-2">{service.description}</p>
                                <div className="mt-2 flex gap-4 text-sm text-slate-500">
                                    <span>{service.email}</span>
                                    <span>{service.contact}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 shrink-0">
                                <button 
                                    onClick={() => handleStatusUpdate(service.id, 'rejected')}
                                    className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <X size={18} />
                                    Reject
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate(service.id, 'approved')}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                >
                                    <Check size={18} />
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AdminServicesPage