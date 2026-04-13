'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Star, Phone, Mail, MessageSquare, User, Calendar, Loader2, X, ShoppingBag, ChevronLeft, ChevronRight, Award, CheckCircle2, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Container from '@/components/Container'
import Image from 'next/image'
import ReviewForm from '@/components/ReviewForm'
import ContactModal from '@/components/ContactModal'
import toast from 'react-hot-toast'
import { useUser } from '@clerk/nextjs'
import { formatPrice } from '@/lib/formatPrice'

const ServiceDetailsClient = () => {
    const { id } = useParams()
    const { user } = useUser()
    const [service, setService] = useState(null)
    const [products, setProducts] = useState([])
    const [isContactOpen, setIsContactOpen] = useState(false)
    const [isAppointmentOpen, setIsAppointmentOpen] = useState(false)
    const [appointmentData, setAppointmentData] = useState({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        date: '',
        notes: ''
    })
    const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('services')

    // 2026 Pro Logic: Calculate accurate rating (e.g. 4.0) from review data
    const calculatedRating = useMemo(() => {
        if (!service?.reviews?.length) return 0;
        const sum = service.reviews.reduce((acc, rev) => acc + rev.rating, 0);
        return sum / service.reviews.length;
    }, [service?.reviews]);

    const ratingBreakdown = useMemo(() => {
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        if (!service?.reviews) return counts;
        service.reviews.forEach(r => {
            if (counts[Math.floor(r.rating)]) counts[Math.floor(r.rating)]++;
        });
        return counts;
    }, [service?.reviews]);

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [currentImages, setCurrentImages] = useState([])
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const openLightbox = (images, index = 0) => {
        if (images && images.length > 0) {
            setCurrentImages(images)
            setCurrentImageIndex(index)
            setLightboxOpen(true)
        }
    }

    const nextImage = (e) => {
        e.stopPropagation()
        setCurrentImageIndex((prev) => (prev + 1) % currentImages.length)
    }

    const prevImage = (e) => {
        e.stopPropagation()
        setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)
    }

    useEffect(() => {
        if (user) {
            setAppointmentData(prev => ({
                ...prev,
                name: user.fullName || '',
                email: user.primaryEmailAddress?.emailAddress || ''
            }));
        }
    }, [user])

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const [serviceRes, productsRes] = await Promise.all([
                    // 2026 Standard: Use revalidation instead of no-store for speed
                    // This allows Next.js to cache the response while keeping it fresh
                    fetch(`/api/service/${id}`, { next: { revalidate: 10 } }),
                    fetch(`/api/service/${id}/service`, { next: { revalidate: 10 } })
                ]);
                if (serviceRes.ok) {
                    const serviceData = await serviceRes.json();
                    setService(serviceData);
                } else {
                    console.error("Failed to fetch service details");
                    setService(null);
                }

                if (productsRes.ok) {
                    const productsData = await productsRes.json();
                    setProducts(productsData);
                } else {
                    console.error("Failed to fetch service offerings");
                }
            } catch (error) {
                console.error("Failed to fetch page data", error);
                toast.error("Could not load service details.");
                setService(null);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleReviewSubmitted = () => {
        if (id) {
            // Refetch service data to show the new review and updated rating
            fetch(`/api/service/${id}`, { cache: 'no-store' })
                .then(res => res.ok ? res.json() : null)
                .then(data => data && setService(data))
                .catch(err => console.error("Failed to refetch service details after review", err));
        }
    }

    const handleAppointmentSubmit = async (e) => {
        e.preventDefault()
        setIsSubmittingAppointment(true)
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...appointmentData, storeId: service.id })
            })

            if (res.ok) {
                toast.success("Appointment request sent!")
                setIsAppointmentOpen(false)
                setAppointmentData({ name: '', email: '', phone: '', whatsapp: '', date: '', notes: '' })
            } else {
                toast.error("Failed to book appointment")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsSubmittingAppointment(false)
        }
    }

    const handleAppointmentChange = (e) => {
        setAppointmentData({ ...appointmentData, [e.target.name]: e.target.value })
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
        <div className="bg-[#F8FAFC] min-h-screen py-12 selection:bg-green-100">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Profile Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center sticky top-24"
                        >
                            <div className="w-40 h-40 mx-auto p-1 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full mb-6 relative">
                                <div className="w-full h-full bg-white rounded-full overflow-hidden relative">
                                {service.logo ? (
                                    <Image 
                                        src={service.logo} 
                                        alt={service.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={48} /></div>
                                )}
                            </div>
                        </div>
                            <h1 className="text-2xl font-bold text-slate-900">{service.name}</h1>
                            <p className="text-slate-500 capitalize mt-1">{service.category}</p>
                            
                            <div className="flex items-center justify-center gap-1 mt-3 text-yellow-500">
                                <Star className="fill-current" size={20} />
                                <span className="font-bold text-slate-900">{calculatedRating > 0 ? calculatedRating.toFixed(1) : 'New'}</span>
                                <span className="text-slate-400 text-sm">({service.reviews?.length || 0} reviews)</span>
                            </div>

                            <div className="mt-6 space-y-3 text-left">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <MapPin size={18} className="shrink-0" />
                                    <span className="text-sm">{service.address}</span>
                                </div>
                                <a href={`tel:${service.contact}`} className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer">
                                    <Phone size={18} className="shrink-0" />
                                    <span className="text-sm">{service.contact}</span>
                                </a>
                                <a href={`mailto:${service.email}`} className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer">
                                    <Mail size={18} className="shrink-0" />
                                    <span className="text-sm">{service.email}</span>
                                </a>
                                {service.whatsappNumber && (
                                    <a 
                                        href={`https://wa.me/${service.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-slate-600 hover:text-green-600 transition-colors cursor-pointer"
                                    >
                                        <MessageSquare size={18} className="shrink-0" />
                                        <span className="text-sm">WhatsApp</span>
                                    </a>
                                )}
                            </div>

                            <div className="space-y-3 mt-8">
                                <button 
                                    onClick={() => setIsContactOpen(true)}
                                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
                                >
                                    Contact Provider
                                </button>
                                <button 
                                    onClick={() => setIsAppointmentOpen(true)}
                                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
                                >
                                    Book Appointment
                                </button>
                            </div>

                            <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} service={service} />
                            
                            {/* Appointment Modal */}
                            {isAppointmentOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                                        <button onClick={() => setIsAppointmentOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                                            <X size={20} />
                                        </button>
                                        <h2 className="text-xl font-bold text-slate-900 mb-4">Book Appointment</h2>
                                        <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                                            <input required name="name" value={appointmentData.name} onChange={handleAppointmentChange} placeholder="Your Name" className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-green-500" />
                                            <input required name="email" type="email" value={appointmentData.email} onChange={handleAppointmentChange} placeholder="Your Email" className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-green-500" />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <input required name="phone" type="tel" value={appointmentData.phone} onChange={handleAppointmentChange} placeholder="Phone Number" className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-green-500" />
                                                <input name="whatsapp" type="tel" value={appointmentData.whatsapp} onChange={handleAppointmentChange} placeholder="WhatsApp Number" className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-green-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-slate-500 ml-1">Preferred Date & Time</label>
                                                <input required name="date" type="datetime-local" value={appointmentData.date} onChange={handleAppointmentChange} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-green-500" />
                                            </div>
                                            <textarea name="notes" value={appointmentData.notes} onChange={handleAppointmentChange} placeholder="Additional Notes (Optional)" rows={3} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                                            <button 
                                                type="submit" 
                                                disabled={isSubmittingAppointment}
                                                className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                            >
                                                {isSubmittingAppointment ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={20} />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    "Confirm Booking"
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column: Description & Reviews */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* About */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{service.description}</p>
                        </div>

                        {/* Service Offerings */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <ShoppingBag size={20} />
                                Service Offerings
                            </h2>
                            {products.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {products.map((product) => (
                                        <div key={product.id} className="border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group bg-white">
                                            <div className="relative h-64 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => openLightbox(product.images)}>
                                                {product.images[0] ? (
                                                    <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400"><ShoppingBag size={32} /></div>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-2 gap-2">
                                                    <h3 className="font-black text-slate-900 text-xl leading-tight tracking-tight">{product.name}</h3>
                                                    {product.price > 0 && (
                                                        <span className="font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg text-sm whitespace-nowrap">
                                                            {formatPrice(product.price)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-700 text-base leading-relaxed mb-8 whitespace-pre-wrap font-medium">{product.description}</p>
                                                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                                                    <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-50 rounded-md uppercase tracking-wider">{product.category}</span>
                                                    {product.price === 0 && (
                                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Contact for Price</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">No service offerings available.</p>
                            )}
                        </div>

                        {/* Work Gallery - Moved to Main Flow */}
                        {service.images && service.images.length > 0 && (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Award size={20} />
                                    Work Gallery
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {service.images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-zoom-in border border-slate-50" onClick={() => openLightbox(service.images, idx)}>
                                            <Image src={img} alt={`Portfolio ${idx + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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

            {/* Image Lightbox Modal */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setLightboxOpen(false)}>
                    <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50">
                        <X size={36} />
                    </button>
                    
                    <div className="relative w-full max-w-5xl h-[85vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <div className="relative w-full h-full">
                            <Image 
                                src={currentImages[currentImageIndex]} 
                                alt="Full view" 
                                fill 
                                className="object-contain" 
                                priority
                            />
                        </div>

                        {currentImages.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md">
                                    <ChevronLeft size={32} />
                                </button>
                                <button onClick={nextImage} className="absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md">
                                    <ChevronRight size={32} />
                                </button>
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
                                    {currentImageIndex + 1} / {currentImages.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ServiceDetailsClient