'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

const EditServicePage = () => {
    const router = useRouter()
    const { id } = useParams()
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [images, setImages] = useState([]) // Holds URL strings or File objects
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        mrp: '',
        category: '',
        stock: '1'
    })

    useEffect(() => {
        if (id) {
            const fetchServiceData = async () => {
                try {
                    const res = await fetch(`/api/service/service/${id}`)
                    if (!res.ok) {
                        toast.error('Failed to fetch service details.')
                        router.push('/service/manage-service')
                        return
                    }
                    const data = await res.json()
                    setFormData({
                        name: data.name,
                        description: data.description || '',
                        price: data.price.toString(),
                        mrp: data.mrp.toString(),
                        category: data.category,
                        stock: data.stock.toString()
                    })
                    setImages(data.images || [])
                } catch (error) {
                    toast.error('An error occurred while fetching data.')
                } finally {
                    setIsFetching(false)
                }
            }
            fetchServiceData()
        }
    }, [id, router])

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
            
            images.forEach(img => {
                if (typeof img === 'string') {
                    data.append('keptImages', img)
                } else {
                    data.append('newImages', img)
                }
            })

            const res = await fetch(`/api/service/service/${id}`, {
                method: 'PATCH',
                body: data
            })

            if (res.ok) {
                toast.success('Service offering updated successfully')
                router.push('/service/manage-service')
            } else {
                const err = await res.json()
                toast.error(err.error || 'Failed to update service')
            }
        } catch (error) {
            console.error(error)
            toast.error('An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" size={40} /></div>
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Edit Service Offering</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Service Name</label><input required name="name" value={formData.name} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Category</label><input required name="category" value={formData.category} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900" /></div>
                </div>
                <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Description</label><textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 resize-none" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Price</label><input type="number" min="0" name="price" value={formData.price} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Original Price (Optional)</label><input type="number" min="0" name="mrp" value={formData.mrp} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900" /></div>
                </div>
                <div className="space-y-4">
                    <label className="text-sm font-medium text-slate-700">Images</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                {typeof img === 'string' ? <Image src={img} alt="Service Image" fill className="object-cover" /> : <img src={URL.createObjectURL(img)} alt="Preview" className="w-full h-full object-cover" />}
                                <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><X size={14} /></button>
                            </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                            <Upload className="text-slate-400 mb-2" />
                            <span className="text-xs text-slate-500">Add Images</span>
                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                    </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                </button>
            </form>
        </div>
    )
}

export default EditServicePage