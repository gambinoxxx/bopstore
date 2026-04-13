'use client'

import { useState } from 'react'
import { Star, Send, Loader2, MessageSquarePlus } from 'lucide-react'
import { motion } from 'framer-motion'

const ReviewForm = ({ storeId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (rating === 0 || !comment.trim()) {
            setError('Please provide a rating and comment.')
            return
        }
        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // The 'user' field is now handled by the backend
                body: JSON.stringify({ storeId, rating, comment }),
            })

            if (res.ok) {
                const newReview = await res.json()
                onReviewSubmitted(newReview) // Notify parent to update UI
                // Reset form
                setRating(0)
                setComment('')
            } else {
                const errData = await res.json()
                setError(errData.error || 'Failed to submit review.')
            }
        } catch (err) {
            setError('An unexpected error occurred.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                    <MessageSquarePlus size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Share your experience</h3>
            </div>
            
            <div className="space-y-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">How would you rate the service?</label>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            key={star}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                size={36}
                                className={`transition-all duration-300 ${
                                    (hoverRating || rating) >= star 
                                    ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' 
                                    : 'text-slate-200'
                                }`}
                            />
                        </motion.button>
                    ))}
                    {rating > 0 && (
                        <motion.span 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="ml-4 text-lg font-black text-slate-900 bg-white px-3 py-1 rounded-xl shadow-sm border border-slate-100"
                        >
                            {rating}.0
                        </motion.span>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-black text-slate-800 ml-1">Your review</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full p-6 rounded-[2rem] bg-slate-50 border-none focus:ring-2 focus:ring-green-500 outline-none resize-none transition-all placeholder:text-slate-300 font-bold text-slate-700"
                    placeholder="What made this experience stand out? (Professionalism, speed, quality...)"
                />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            
            <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-slate-800 transition-all disabled:opacity-70 flex items-center justify-center gap-3 shadow-2xl shadow-slate-300 group"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                Publish My Review
            </motion.button>
        </form>
    )
}

export default ReviewForm
