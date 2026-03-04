'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Star, Phone, Mail, MessageSquare, User, Calendar, Loader2 } from 'lucide-react'
import Container from '@/components/Container'
import Image from 'next/image'
import ReviewForm from '@/components/ReviewForm'
import ContactModal from '@/components/ContactModal'

const ServiceDetailsPage = () => {
    const { id } = useParams()
    const [service, setService] = useState(null)
    const [isContactOpen, setIsContactOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (id) fetchService(id)
    }, [id])

    const fetchService = async (serviceId) => {
        try {
            const res = await fetch(`/api/services/${serviceId}`)
            if (res.ok) {
                const data = await res.json()
                setService(data)
            }
        } catch (error) {
            console.error("Failed to fetch service details", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleReviewSubmitted = () => {
        fetchService(id) // Refetch service data to show the new review and updated rating
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-slate-400" size={40} />
            </div>
        )
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500">Service provider not found.</p>
            </div>
        )
    }

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
                            <div className="w-32 h-32 mx-auto bg-slate-200 rounded-full overflow-hidden mb-4 relative">
                                <Image 
                                    src={service.logo || "https://via.placeholder.com/150"} 
                                    alt={service.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">{service.name}</h1>
                            <p className="text-slate-500 capitalize mt-1">{service.category}</p>
                            
                            <div className="flex items-center justify-center gap-1 mt-3 text-yellow-500">
                                <Star className="fill-current" size={20} />
                                <span className="font-bold text-slate-900">{service.rating ? service.rating.toFixed(1) : 'New'}</span>
                                <span className="text-slate-400 text-sm">({service.reviews?.length || 0} reviews)</span>
                            </div>

                            <div className="mt-6 space-y-3 text-left">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <MapPin size={18} className="shrink-0" />
                                    <span className="text-sm">{service.address}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone size={18} className="shrink-0" />
                                    <span className="text-sm">{service.contact}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail size={18} className="shrink-0" />
                                    <span className="text-sm">{service.email}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => setIsContactOpen(true)}
                                className="w-full mt-8 py-3 bg-green-500 hover:bg-green-600 text-slate-900 font-bold rounded-xl transition-colors"
                            >
                                Contact Provider
                            </button>

                            <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} service={service} />
                        </div>

                        {service.images && service.images.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h3 className="font-bold text-lg text-slate-900 mb-4">Portfolio</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {service.images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                                            <Image src={img} alt={`Portfolio ${idx + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Description & Reviews */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{service.description}</p>
                        </div>

                        {/* Reviews */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MessageSquare size={20} />
                                Customer Reviews
                            </h2>
                            
                            <div className="space-y-6">
                                {service.reviews && service.reviews.length > 0 ? (
                                    service.reviews.map((review) => (
                                        <div key={review.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                                                        <User size={14} />
                                                    </div>
                                                    <span className="font-medium text-slate-900">{review.user}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-yellow-500">
                                                    <Star size={14} className="fill-current" />
                                                    <span className="text-sm font-medium">{review.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 text-sm">{review.comment}</p>
                                            <div className="flex items-center gap-1 text-slate-400 text-xs mt-2">
                                                <Calendar size={12} />
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 italic">No reviews yet.</p>
                                )}
                            </div>

                            <div className="mt-8 border-t border-slate-200 pt-8">
                                <ReviewForm storeId={service.id} onReviewSubmitted={handleReviewSubmitted} />
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default ServiceDetailsPage