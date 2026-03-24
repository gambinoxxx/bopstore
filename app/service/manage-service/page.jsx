'use client'
import React, { useState, useEffect } from 'react'
import { Loader2, Trash2, Edit, Plus, X, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/formatPrice'

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="text-red-600" size={32} />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center text-slate-900 mb-2">Delete Service</h2>
                <p className="text-center text-slate-500 mb-6">Are you sure you want to delete this service offering? This action cannot be undone.</p>
                <div className="flex gap-4">
                    <button onClick={onClose} className="w-full py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={isLoading} className="w-full py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    )
}

const ManageServicePage = () => {
    const [services, setServices] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [serviceToDelete, setServiceToDelete] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchServices(currentPage)
    }, [currentPage])

    const fetchServices = async (page) => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/service/service?page=${page}&limit=6`, { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                setServices(data.products)
                setTotalPages(data.totalPages)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to fetch services")
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenDeleteModal = (service) => {
        setServiceToDelete(service)
        setShowDeleteModal(true)
    }

    const handleCloseDeleteModal = () => {
        setServiceToDelete(null)
        setShowDeleteModal(false)
    }

    const handleDeleteConfirm = async () => {
        if (!serviceToDelete) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/service/service/${serviceToDelete.id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success('Service deleted')
                // Refetch services for the current page
                fetchServices(currentPage)
                handleCloseDeleteModal()
            } else {
                toast.error('Failed to delete service')
            }
        } catch (error) {
            toast.error('An error occurred')
        } finally {
            setIsDeleting(false)
        }
    }

    if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" size={40} /></div>

    return (
        <div className="max-w-6xl mx-auto">
            <DeleteConfirmationModal isOpen={showDeleteModal} onClose={handleCloseDeleteModal} onConfirm={handleDeleteConfirm} isLoading={isDeleting} />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Manage Services</h1>
                <Link href="/service/add-service" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                    <Plus size={18} /> Add Service
                </Link>
            </div>

            {!isLoading && services.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                    <p className="text-slate-500">No service offerings found. Start by adding one.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map(service => (
                        <div key={service.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative h-48 bg-slate-100">
                                <Image src={service.images[0] || '/placeholder.png'} alt={service.name} fill className="object-cover" />
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900 mb-1">{service.name}</h3>
                                <p className="text-slate-500 text-sm mb-3">{service.category}</p>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-slate-900">{service.price > 0 ? formatPrice(service.price) : 'Contact for Price'}</span>
                                    <div className="flex items-center gap-1">
                                        <Link href={`/service/edit-service/${service.id}`} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" aria-label="Edit Service">
                                            <Edit size={18} />
                                        </Link>
                                        <button onClick={() => handleOpenDeleteModal(service)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" aria-label="Delete Service">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                    <button 
                        onClick={() => setCurrentPage(p => p - 1)} 
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50">
                        Previous
                    </button>
                    <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50">
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

export default ManageServicePage