'use client'
import React, { useState, useEffect } from 'react'
import { Loader2, MessageSquare, Calendar, Star, Users } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'

const ServiceDashboard = () => {
    const { isLoaded, isSignedIn } = useUser()
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({
        appointments: 0,
        rating: 0,
        reviews: 0
    })

    useEffect(() => {
        if (isLoaded && isSignedIn) fetchStats()
    }, [isLoaded, isSignedIn])

    const fetchStats = async () => {
        try {
            const res = await fetch(`/api/service/dashboard`)
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load dashboard stats")
        } finally {
            setIsLoading(false)
        }
    }

    const cards = [
        { title: 'Appointments', value: stats.appointments, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
        { title: 'Rating', value: stats.rating.toFixed(1), icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { title: 'Reviews', value: stats.reviews, icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
    ]

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-400" size={40} />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Service Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {cards.map((card, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">{card.title}</p>
                            <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center py-20">
                <p className="text-slate-500">More detailed analytics and charts coming soon.</p>
            </div>
        </div>
    )
}

export default ServiceDashboard