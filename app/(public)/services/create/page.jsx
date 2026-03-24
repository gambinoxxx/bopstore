'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from 'next/navigation'
import axios from "axios"
import { SERVICE_CATEGORIES } from "@/lib/constants"

export default function CreateService() {
    const { user } = useUser()
    const router = useRouter()
    const { getToken } = useAuth()

    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")

    const [formData, setFormData] = useState({
        name: "",
        category: 'tailor',
        description: "",
        email: "",
        phone: "",
        location: "",
        whatsappNumber: ""
    })
    const [logo, setLogo] = useState(null)
    const [portfolio, setPortfolio] = useState([])

    
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const fetchServiceStatus = async () => {
        const token = await getToken()
        try {
            const { data } = await axios.get('/api/service/is-provider', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (["approved", "rejected", "pending"].includes(data.status)) {
                setStatus(data.status)
                setAlreadySubmitted(true)
                if (data.type === 'store') {
                    setMessage("You are already registered as a Seller.")
                    setTimeout(() => router.push("/store"), 3000)
                } else {
                    switch (data.status) {
                        case "approved":
                            setMessage("Your service has been approved! Redirecting to dashboard...")
                            setTimeout(() => router.push("/service"), 3000)
                            break;
                        case "rejected":
                            setMessage("Your service request has been rejected. Contact admin for details.")
                            break;
                        case "pending":
                            setMessage("Your service request is pending approval.")
                            break;
                        default:
                            break;
                    }
                }
            } else {
                setAlreadySubmitted(false)
            }
        } catch (error) {
            // Ignore errors if not registered
        }
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!user) return toast("Please login to continue", { icon: '🔐' })

        try {
            const token = await getToken()
            const data = new FormData()
            data.append('name', formData.name)
            data.append('category', formData.category)
            data.append('description', formData.description)
            data.append('location', formData.location)
            data.append('phone', formData.phone)
            data.append('email', formData.email)
            data.append('whatsappNumber', formData.whatsappNumber)

            if (logo) {
                data.append('logo', logo)
            }

            const res = await axios.post('/api/service', data, {
                headers: { Authorization: `Bearer ${token}` }
            })

            toast.success("Service submitted successfully!")
            await fetchServiceStatus()
        } catch (error) {
            toast.error(error.response?.data?.error || error.message)
        }
    }

    useEffect(() => {
        if (user) {
            fetchServiceStatus()
        }
    }, [user])

    if (!user) {
        return (
            <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                <h1 className="text-2xl sm:text-4xl font-semibold">Please <span className="text-slate-500">Login</span> to continue</h1>
            </div>
        )
    }

    return !loading ? (
        <>
            {!alreadySubmitted ? (
                <div className="mx-6 min-h-[70vh] my-16">
                    <form onSubmit={e => toast.promise(handleSubmit(e), { loading: "Submitting service..." })} className="max-w-7xl mx-auto flex flex-col items-start gap-3 text-slate-500">
                        <div>
                            <h1 className="text-3xl">Register <span className="text-slate-800 font-medium">Service</span></h1>
                            <p className="max-w-lg">Join our network of professionals. Submit your service details for review.</p>
                        </div>

                        <label className="mt-10 cursor-pointer">
                            Service Logo
                            <Image src={logo ? URL.createObjectURL(logo) : assets.upload_area} className="rounded-lg mt-2 h-16 w-auto" alt="" width={150} height={100} />
                            <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} hidden />
                        </label>

                        <p>Business Name</p>
                        <input name="name" onChange={handleChange} value={formData.name} type="text" placeholder="e.g. Grace Stitches" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Category</p>
                        <select name="category" onChange={handleChange} value={formData.category} className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded bg-white">
                            {SERVICE_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        <p>Description</p>
                        <textarea name="description" onChange={handleChange} value={formData.description} rows={5} placeholder="Describe your services..." className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" />

                        <p>Location</p>
                        <input name="location" onChange={handleChange} value={formData.location} type="text" placeholder="e.g. Lekki Phase 1" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Email</p>
                        <input name="email" onChange={handleChange} value={formData.email} type="email" placeholder="contact@business.com" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Phone Number</p>
                        <input name="phone" onChange={handleChange} value={formData.phone} type="tel" placeholder="+234..." className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>WhatsApp Number</p>
                        <input name="whatsappNumber" onChange={handleChange} value={formData.whatsappNumber} type="tel" placeholder="+234..." className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <button className="bg-slate-800 text-white px-12 py-2 rounded mt-10 mb-40 active:scale-95 hover:bg-slate-900 transition">Submit Service</button>
                    </form>
                </div>
            ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center">
                    <p className="sm:text-2xl lg:text-3xl mx-5 font-semibold text-slate-500 text-center max-w-2xl">{message}</p>
                    {status === "approved" && <p className="mt-5 text-slate-400">redirecting to dashboard in <span className="font-semibold">3 seconds</span></p>}
                </div>
            )}
        </>
    ) : (<Loading />)
}