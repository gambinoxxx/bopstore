'use client'
import React, { useState, useEffect } from 'react'
import { Loader2, Upload, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

const ServiceManagePage = () => {
    const [service, setService] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [newImages, setNewImages] = useState([])
    const [existingImages, setExistingImages] = useState([])

    useEffect(() => {
        fetchService()
    }, [])

    const fetchService = async () => {
        try {
            const res = await fetch('/api/store/service')
            if (res.ok) {
                const data = await res.json()
                setService(data)
                setExistingImages(data.images || [])
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageChange = (e) => {
        if (e.target.files) {
            setNewImages([...newImages, ...Array.from(e.target.files)])
        }
    }

    const removeNewImage = (index) => {
        setNewImages(newImages.filter((_, i) => i !== index))
    }

    const removeExistingImage = (index) => {
        setExistingImages(existingImages.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const formData = new FormData()
            
            // Append existing images as strings
            existingImages.forEach(url => formData.append('existingImages', url))
            
            // Append new files
            newImages.forEach(file => formData.append('images', file))

            const res = await fetch('/api/store/service', {
                method: 'PATCH',
                body: formData
            })

            if (res.ok) {
                toast.success('Service updated successfully')
                setNewImages([])
                fetchService()
            } else {
                toast.error('Failed to update service')
            }
        } catch (error) {
            console.error(error)
            toast.error('An error occurred')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
    if (!service) return <div className="p-10 text-center">Service not found. Please register as a service provider first.</div>

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Manage Service Portfolio</h1>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
                <h2 className="font-semibold mb-4">Current Portfolio Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group">
                            <Image src={img} alt="Portfolio" fill className="object-cover" />
                            <button 
                                onClick={() => removeExistingImage(idx)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    {existingImages.length === 0 && <p className="text-slate-400 text-sm col-span-full">No images uploaded yet.</p>}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
                <h2 className="font-semibold mb-4">Add New Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {newImages.map((file, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                                onClick={() => removeNewImage(idx)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                        <Upload className="text-slate-400 mb-2" />
                        <span className="text-xs text-slate-500">Upload</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                </div>
            </div>

            <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-70"
            >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Save Changes
            </button>
        </div>
    )
}

export default ServiceManagePage