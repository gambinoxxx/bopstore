'use client'
import React, { useState } from 'react'
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const AddServicePage = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [images, setImages] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        mrp: '',
        category: '',
        stock: '1' // Default to 1 for service, can be treated as "available"
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (e) => {
        if (e.target.files) {
            setImages([...images, ...Array.from(e.target.files)])
        }
    }

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const data = new FormData()
            Object.keys(formData).forEach(key => data.append(key, formData[key]))
            images.forEach(file => data.append('images', file))

            const res = await fetch('/api/service/service', {
                method: 'POST',
                body: data
            })

            if (res.ok) {
                toast.success('Service offering added successfully')
                router.push('/service/manage-service')
            } else {
                const err = await res.json()
                toast.error(err.error || 'Failed to add service')
            }
        } catch (error) {
            console.error(error)
            toast.error('An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Add New Service Offering</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Service Name</label>
                        <input required name="name" value={formData.name} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. Wedding Dress Design" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Category</label>
                        <input required name="category" value={formData.category} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. Bespoke Tailoring" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 resize-none" placeholder="Describe the service offering..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Price</label>
                        <input type="number" min="0" name="price" value={formData.price} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900" placeholder="0.00 (Optional)" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Original Price (Optional)</label>
                        <input type="number" min="0" name="mrp" value={formData.mrp} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900" placeholder="0.00" />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-medium text-slate-700">Images (Add 2-3 images)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((file, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><X size={14} /></button>
                            </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                            <Upload className="text-slate-400 mb-2" />
                            <span className="text-xs text-slate-500">Upload Images</span>
                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                    </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Create Service'}
                </button>
            </form>
        </div>
    )
}

export default AddServicePage