'use client'

import { useState } from 'react'
import { Star, Send, Loader2 } from 'lucide-react'

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
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Leave a Review</h3>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Rating</label>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={24}
                            className={`cursor-pointer transition-colors ${
                                (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'
                            }`}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Comment</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                    placeholder="Share your experience..."
                />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                Submit Review
            </button>
        </form>
    )
}

export default ReviewForm
