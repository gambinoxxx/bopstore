'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Save, Trash2, Upload, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import Container from '@/components/Container'
import StoreNavbar from '@/components/store/StoreNavbar'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useUser } from '@clerk/nextjs'

const EditServicePage = () => {
    const { id } = useParams()
    const router = useRouter()
    const { isLoaded, isSignedIn } = useUser()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        location: '',
        phone: '',
        email: '',
        whatsappNumber: ''
    })
    const [logoUrl, setLogoUrl] = useState('')
    const [logoFile, setLogoFile] = useState(null)
    const [existingImages, setExistingImages] = useState([])
    const [newImages, setNewImages] = useState([])

    const categories = [
        { id: 'tailor', name: 'Tailoring' },
        { id: 'mechanic', name: 'Mechanic' },
        { id: 'food', name: 'Food Vendor' },
        { id: 'carpenter', name: 'Carpentry' },
        { id: 'cleaning', name: 'Cleaning' },
        { id: 'plumbing', name: 'Plumbing' },
    ]

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/my-services')
            return
        }
        if (id) fetchService()
    }, [id, isLoaded, isSignedIn])

    const fetchService = async () => {
        try {
            const res = await fetch(`/api/services/${id}`)
            if (res.ok) {
                const data = await res.json()
                setFormData({
                    name: data.name,
                    category: data.category,
                    description: data.description,
                    location: data.address,
                    phone: data.contact,
                    email: data.email,
                    whatsappNumber: data.whatsappNumber
                })
                setLogoUrl(data.logo)
                setExistingImages(data.images || [])
            } else {
                toast.error("Failed to load service details")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleRemoveExistingImage = (imgUrl) => {
        setExistingImages(prev => prev.filter(img => img !== imgUrl))
    }

    const handleRemoveNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const data = new FormData()
            data.append('name', formData.name)
            data.append('category', formData.category)
            data.append('description', formData.description)
            data.append('location', formData.location)
            data.append('phone', formData.phone)
            data.append('email', formData.email)
            data.append('whatsappNumber', formData.whatsappNumber)

            if (logoFile) {
                data.append('logo', logoFile)
            }

            // Append existing images that we want to keep
            existingImages.forEach(img => {
                data.append('keptImages', img)
            })

            // Append new images
            Array.from(newImages).forEach(file => {
                data.append('newImages', file)
            })

            const res = await fetch(`/api/services/${id}`, {
                method: 'PATCH',
                body: data
            })

            if (res.ok) {
                toast.success('Service updated successfully!')
                fetchService() // Refresh data
                setNewImages([]) // Clear upload queue
                setLogoFile(null)
            } else {
                const err = await res.json()
                toast.error(err.error || 'Failed to update service')
            }
        } catch (error) {
            console.error(error)
            toast.error('An unexpected error occurred')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <>
                <StoreNavbar />
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <Loader2 className="animate-spin text-slate-400" size={40} />
                </div>
            </>
        )
    }

    return (
        <>
            <StoreNavbar />
            <div className="bg-slate-50 min-h-screen py-12">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                            <ArrowLeft size={20} /> Back to My Services
                        </button>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-2xl font-bold text-slate-900">Edit Service Details</h1>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Business Name</label>
                                        <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Category</label>
                                        <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none bg-white">
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Description</label>
                                    <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none resize-none" />
                                </div>

                                {/* Contact Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Location</label>
                                        <input required name="location" value={formData.location} onChange={handleChange} type="text" className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Phone</label>
                                        <input required name="phone" value={formData.phone} onChange={handleChange} type="text" className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Email</label>
                                        <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">WhatsApp</label>
                                        <input required name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} type="text" className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none" />
                                    </div>
                                </div>

                                {/* Portfolio Images */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-700">Portfolio Images</label>
                                        <label className="cursor-pointer flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                            <Upload size={16} /> Add Images
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setNewImages(prev => [...prev, ...Array.from(e.target.files)])} />
                                        </label>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {existingImages.map((img, idx) => (
                                            <div key={`exist-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group bg-slate-100 border border-slate-200">
                                                <Image src={img} alt="Portfolio" fill className="object-cover" />
                                                <button type="button" onClick={() => handleRemoveExistingImage(img)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {newImages.map((file, idx) => (
                                            <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group bg-slate-100 border border-slate-200">
                                                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                                    <ImageIcon size={24} />
                                                </div>
                                                <Image src={URL.createObjectURL(file)} alt="New Upload" fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/20" />
                                                <button type="button" onClick={() => handleRemoveNewImage(idx)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600">
                                                    <Trash2 size={14} />
                                                </button>
                                                <span className="absolute bottom-2 left-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">New</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <button type="submit" disabled={isSaving} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2">
                                        {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Container>
            </div>
        </>
    )
}

export default EditServicePage