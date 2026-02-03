'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { DeleteIcon, Flame, Trophy } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import axios from "axios" // 👈 ADDED: axios import


export default function AdminCoupons() {
    const { getToken } = useAuth()

    const [coupons, setCoupons] = useState([])

    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discount: '',
        forNewUser: false,
        forMember: false,
        isPublic: false,
        expiresAt: format(new Date(), 'yyyy-MM-dd') 
    })

    // State for Hot Deal
    const [deal, setDeal] = useState({ title: "", description: "", endDate: "" });
    const [dealLoading, setDealLoading] = useState(true);

    // State for Vendor of the Week
    const [vendors, setVendors] = useState([
        { rank: 1, name: '', deals: 0 },
        { rank: 2, name: '', deals: 0 },
        { rank: 3, name: '', deals: 0 },
    ]);
    const [stores, setStores] = useState([]);

    // --- Coupon Functions ---

    const fetchCoupons = async () => {
        try {
            const token = await getToken()
            // 💡 CHANGED API PATH: from '/api/admin/coupons' to '/api/coupon'
            const { data } = await axios.get('/api/admin/coupon', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setCoupons(data.coupons)
        } catch (error) {
            // Fix typo: error.meassge -> error.message
            toast.error(error?.response?.data?.error || error.message) 
        }
    }

    const handleAddCoupon = async (e) => {
        e.preventDefault()
        try {
            const token = await getToken()

            // 💡 Data transformation (good practice)
            const couponData = {
                ...newCoupon,
                discount: Number(newCoupon.discount),
                // Ensure date is sent as a proper ISO string if needed, 
                // but new Date(newCoupon.expiresAt) is okay for Prisma if the input value is a date string.
                expiresAt: new Date(newCoupon.expiresAt) 
            };

            // 💡 CHANGED API PATH: from '/api/admin/coupon' to '/api/coupon'
            const { data } = await axios.post('/api/admin/coupon', { coupon: couponData }, { 
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            toast.success(data.message)
            
            // Clear the form after successful add
            setNewCoupon({
                 code: '',
                 description: '',
                 discount: '',
                 forNewUser: false,
                 forMember: false,
                 isPublic: false,
                 expiresAt: new Date()
            });

            await fetchCoupons()
        } catch (error) {
             toast.error(error?.response?.data?.error || error.message)
        }
    }

    const handleChange = (e) => {
        // Handle checkbox toggles for boolean fields (forNewUser, forMember)
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setNewCoupon({ ...newCoupon, [e.target.name]: value })
    }

    // --- Hot Deal Functions ---

    const fetchCurrentDeal = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get("/api/admin/coupon?action=hotdeal", {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (data.endDate) {
          const date = new Date(data.endDate);
          const formattedDate = date.toISOString().slice(0, 16);
          setDeal({ ...data, endDate: formattedDate });
        } else {
          setDeal(data);
        }
      } catch (error) {
        toast.error("Failed to fetch current deal settings.");
      } finally {
        setDealLoading(false);
      }
    };

    const handleDealInputChange = (e) => {
        const { name, value } = e.target;
        setDeal((prev) => ({ ...prev, [name]: value }));
    };

    const handleDealSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            const payload = {
                ...deal,
                endDate: new Date(deal.endDate).toISOString(),
            };
            const { data } = await axios.post("/api/admin/coupon?action=hotdeal", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(data.message);
        } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to update deal.");
        }
    };

    // --- Vendor Functions ---

    const handleVendorChange = (index, field, value) => {
        const newVendors = [...vendors];
        newVendors[index][field] = value;
        setVendors(newVendors);
    };

    const handleSaveVendors = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/vendor-ranking', { vendors }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(data.message);
        } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to save rankings");
        }
    };

    const fetchStores = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/store/name', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStores(data.stores || []);
        } catch (error) {
            console.error("Failed to fetch stores", error);
        }
    };

    const fetchVendorRankings = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/vendor-ranking', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.rankings && data.rankings.length > 0) {
                const mergedVendors = [1, 2, 3].map(rank => {
                    const existing = data.rankings.find(r => r.rank === rank);
                    return existing ? { rank, name: existing.name, deals: existing.deals } : { rank, name: '', deals: 0 };
                });
                setVendors(mergedVendors);
            }
        } catch (error) {
            console.error("Failed to fetch vendor rankings", error);
        }
    };

    // --- Main useEffect ---

    // ✅ IMPLEMENTED FUNCTION
    const deleteCoupon = async (code) => {
        try {
            const token = await getToken()
            
            // 💡 Send DELETE request with the coupon code as a query parameter
            const { data } = await axios.delete(`/api/admin/coupon?code=${code}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            toast.success(data.message)
            await fetchCoupons() // Reload the list
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    // The rest of your component remains the same for the return statement...
    useEffect(() => {
        fetchCoupons()
        fetchCurrentDeal()
        fetchStores()
        fetchVendorRankings()
    }, [])

    return (
        <div className="text-slate-500 mb-40 space-y-16">
            {/* Manage Hot Deal Section */}
            <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <Flame className="text-orange-500" size={28} />
                    <h1 className="text-2xl font-bold text-slate-800">Manage Hot Deal</h1>
                </div>
                {dealLoading ? <p>Loading deal settings...</p> : (
                    <form onSubmit={e => toast.promise(handleDealSubmit(e), { loading: "Saving Deal..." })} className="space-y-6 text-slate-600">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium">Deal Title</label>
                            <input id="title" name="title" value={deal.title} onChange={handleDealInputChange} placeholder="e.g., Summer Mega Sale" className="mt-1 p-2 px-4 outline-none border border-slate-300 rounded w-full" required />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium">Description</label>
                            <textarea id="description" name="description" value={deal.description} onChange={handleDealInputChange} placeholder="A short, catchy description for the deal." rows={3} className="mt-1 p-2 px-4 outline-none border border-slate-300 rounded w-full resize-none" required />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium">End Date & Time</label>
                            <input id="endDate" name="endDate" type="datetime-local" value={deal.endDate} onChange={handleDealInputChange} className="mt-1 p-2 px-4 outline-none border border-slate-300 rounded w-full" required />
                        </div>
                        <button type="submit" className="w-full bg-slate-800 text-white font-medium py-3 rounded-md hover:bg-slate-900 active:scale-95 transition-all">
                            Save Deal Settings
                        </button>
                    </form>
                )}
            </div>

            {/* Divider */}
            <hr className="border-slate-200" />

            {/* Vendor of the Week Section */}
            <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <Trophy className="text-yellow-500" size={28} />
                    <h1 className="text-2xl font-bold text-slate-800">Vendor of the Week</h1>
                </div>
                <p className="text-slate-500 mb-8">Manually select the top 3 vendors and input their closed deals count.</p>
                
                <div className="space-y-6">
                    {vendors.map((vendor, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end border-b border-slate-100 pb-6 last:border-0">
                            <div className="w-12 font-bold text-3xl text-slate-300">#{vendor.rank}</div>
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Vendor Name</label>
                                <select
                                    value={vendor.name}
                                    onChange={(e) => handleVendorChange(index, 'name', e.target.value)}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white"
                                >
                                    <option value="" disabled>Select Vendor</option>
                                    {stores.map((store) => (
                                        <option key={store.id} value={store.name}>{store.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full sm:w-40">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Deals Closed</label>
                                <input 
                                    type="number" 
                                    value={vendor.deals}
                                    onChange={(e) => handleVendorChange(index, 'deals', e.target.value)}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <button 
                    onClick={handleSaveVendors}
                    className="mt-8 bg-slate-800 text-white font-medium py-3 px-8 rounded-md hover:bg-slate-900 active:scale-95 transition-all"
                >
                    Save Vendor Rankings
                </button>
            </div>

            {/* Divider */}
            <hr className="border-slate-200" />

            {/* Manage Coupons Section */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Manage Coupons</h1>
                {/* Add Coupon Form */}
            <form onSubmit={(e) => toast.promise(handleAddCoupon(e), { loading: "Adding coupon..." })} className="max-w-sm text-sm">
                <h2 className="text-2xl">Add <span className="text-slate-800 font-medium">Coupons</span></h2>
                <div className="flex gap-2 max-sm:flex-col mt-2">
                    <input type="text" placeholder="Coupon Code" className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
                        name="code" value={newCoupon.code} onChange={handleChange} required
                    />
                    <input type="number" placeholder="Coupon Discount (%)" min={1} max={100} className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
                        name="discount" value={newCoupon.discount} onChange={handleChange} required
                    />
                </div>
                <input type="text" placeholder="Coupon Description" className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
                    name="description" value={newCoupon.description} onChange={handleChange} required
                />

                <label>
                    <p className="mt-3">Coupon Expiry Date</p>
                    <input type="date" placeholder="Coupon Expires At" className="w-full mt-1 p-2 border border-slate-200 outline-slate-400 rounded-md"
                        name="expiresAt" value={format(newCoupon.expiresAt, 'yyyy-MM-dd')} onChange={handleChange}
                    />
                </label>

                <div className="mt-5">
                    {/* Simplified handleChange for checkboxes (though your original worked too) */}
                    <div className="flex gap-2 mt-3">
                        <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                            <input type="checkbox" className="sr-only peer"
                                name="forNewUser" checked={newCoupon.forNewUser}
                                onChange={handleChange} 
                            />
                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                        </label>
                        <p>For New User</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                            <input type="checkbox" className="sr-only peer"
                                name="forMember" checked={newCoupon.forMember}
                                onChange={handleChange} 
                            />
                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                        </label>
                        <p>For Member</p>
                    </div>
                </div>
                <button className="mt-4 p-2 px-10 rounded bg-slate-700 text-white active:scale-95 transition">Add Coupon</button>
            </form>

            {/* List Coupons Table */}
            <div className="mt-14">
                <h2 className="text-2xl">List <span className="text-slate-800 font-medium">Coupons</span></h2>
                <div className="overflow-x-auto mt-4 rounded-lg border border-slate-200 max-w-4xl">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">Code</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">Description</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">Discount</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">Expires At</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">New User</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">For Member</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {coupons.map((coupon) => (
                                <tr key={coupon.code} className="hover:bg-slate-50">
                                    <td className="py-3 px-4 font-medium text-slate-800">{coupon.code}</td>
                                    <td className="py-3 px-4 text-slate-800">{coupon.description}</td>
                                    <td className="py-3 px-4 text-slate-800">{coupon.discount}%</td>
                                    {/* Ensure coupon.expiresAt is a valid Date object or ISO string */}
                                    <td className="py-3 px-4 text-slate-800">{format(new Date(coupon.expiresAt), 'yyyy-MM-dd')}</td>
                                    <td className="py-3 px-4 text-slate-800">{coupon.forNewUser ? 'Yes' : 'No'}</td>
                                    <td className="py-3 px-4 text-slate-800">{coupon.forMember ? 'Yes' : 'No'}</td>
                                    <td className="py-3 px-4 text-slate-800">
                                        <DeleteIcon onClick={() => toast.promise(deleteCoupon(coupon.code), { loading: "Deleting coupon..." })} className="w-5 h-5 text-red-500 hover:text-red-800 cursor-pointer" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
        </div>
    )
}
