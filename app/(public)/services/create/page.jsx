'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle } from 'lucide-react'
import Container from '@/components/Container'
import toast from 'react-hot-toast'
import { useUser, SignInButton } from '@clerk/nextjs'

const CreateServicePage = () => {
    const { isLoaded, isSignedIn } = useUser()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        category: 'tailor',
        description: '',
        location: '',
        phone: '',
        email: '',
        whatsappNumber: ''
    })
    const [logoFile, setLogoFile] = useState(null)
    const [portfolioFiles, setPortfolioFiles] = useState([])

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            const checkExisting = async () => {
                try {
                    const res = await fetch('/api/store/create')
                    if (res.ok) {
                        const data = await res.json()
                        if (data.status && data.status !== 'not registered') {
                            if (data.type === 'store') {
                                toast.error("You are already registered as a Seller.")
                                router.push('/store')
                            } else {
                                toast.error("You already have a Service Profile.")
                                router.push('/my-services')
                            }
                        }
                    }
                } catch (error) {
                    console.error(error)
                }
            }
            checkExisting()
        }
    }, [isLoaded, isSignedIn, router])

    const categories = [
        { id: 'tailor', name: 'Tailoring' },
        { id: 'mechanic', name: 'Mechanic' },
        { id: 'food', name: 'Food Vendor' },
        { id: 'carpenter', name: 'Carpentry' },
        { id: 'cleaning', name: 'Cleaning' },
        { id: 'plumbing', name: 'Plumbing' },
    ]

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

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

            if (portfolioFiles.length > 0) {
                Array.from(portfolioFiles).forEach(file => {
                    data.append('images', file)
                })
            }

            const res = await fetch('/api/services', {
                method: 'POST',
                body: data
            })

            if (res.ok) {
                toast.success('Service submitted for approval!')
                router.push('/my-services')
                router.refresh()
            } else {
                const errorData = await res.json()
                toast.error(errorData.error || 'Failed to create service')
            }
        } catch (error) {
            console.error(error)
            toast.error('An unexpected error occurred.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-slate-400" size={40} />
            </div>
        )
    }

    if (!isSignedIn) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Sign in Required</h2>
                <p className="text-slate-500">Please sign in to register a service.</p>
                <SignInButton mode="modal">
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors">
                        Sign In
                    </button>
                </SignInButton>
            </div>
        )
    }

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
                >
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-900">Register as a Service Provider</h1>
                        <p className="text-slate-500 mt-2">Join our network of professionals and grow your business.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Business Name</label>
                                <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" placeholder="e.g. Grace Stitches" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all bg-white">
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Description</label>
                            <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all resize-none" placeholder="Describe your services, experience, and what makes you unique..." />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Location</label>
                            <div className="relative">
                                <input required name="location" value={formData.location} onChange={handleChange} type="text" className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" placeholder="e.g. Lekki Phase 1, Lagos" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" placeholder="+234..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" placeholder="contact@business.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">WhatsApp Number</label>
                                <input required name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} type="tel" className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" placeholder="+234..." />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Profile Logo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setLogoFile(e.target.files[0])}
                                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Portfolio Images (Select Multiple)</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => setPortfolioFiles(e.target.files)}
                                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                            />
                            <p className="text-xs text-slate-500 mt-1">You can select multiple images at once.</p>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        Register Service
                                        <CheckCircle size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </Container>
        </div>
    )
}

export default CreateServicePage