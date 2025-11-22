'use client'
import { assets } from "@/assets/assets"
import { useAuth } from "@clerk/nextjs"
import Image from "next/image"
import axios from "axios"
import { useState } from "react"
import toast from "react-hot-toast"

export default function StoreAddProduct() {

    const categories = [
        'Phones & Tablets',
        'Laptops & Desktops',
        'Televisions & Audio',
        'Cameras & Drones',
        'Large Appliances',
        'Small Appliances',
        "Men's Fashion",
        "Women's Fashion",
        "Kid's Fashion",
        'Shoes & Footwear',
        'Watches & Jewelry',
        'Health & Beauty',
        'Makeup & Fragrances',
        'Groceries & Food',
        'Home & Office Furniture',
        'Kitchen & Dining',
        'Baby Products',
        'Gaming & Consoles',
        'Sporting Goods',
        'Automobile Parts & Accessories',
        'Books & Media',
        'Other'
    ]

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        category: "",
    })
    const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
    const [loading, setLoading] = useState(false)

    const { getToken } = useAuth()

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    // --- Specification Handlers ---
    const handleSpecChange = (index, event) => {
        const values = [...specifications];
        values[index][event.target.name] = event.target.value;
        setSpecifications(values);
    };

    const addSpecField = () => {
        // Prevent adding new fields if the last one is empty
        if (specifications[specifications.length - 1]?.key === '' && specifications[specifications.length - 1]?.value === '') {
            return toast.error("Please fill the current specification field first.");
        }
        setSpecifications([...specifications, { key: '', value: '' }]);
    };

    const removeSpecField = (index) => {
        const values = [...specifications];
        values.splice(index, 1);
        setSpecifications(values);
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        try {
            // if no image are uploaded
            if (!images[1] && !images[2] && !images[3] && !images[4]) {
                return toast.error("Please upload at least one image")
            }
            setLoading(true)

            const formData = new FormData()
            formData.append('name', productInfo.name)
            formData.append('description', productInfo.description)
            formData.append('mrp', productInfo.mrp)
            formData.append('price', productInfo.price)
            formData.append('category', productInfo.category)

            // Convert specifications array to a JSON object and stringify it
            const specsObject = specifications.reduce((obj, item) => {
                if (item.key.trim() && item.value.trim()) { // Only add if key and value are not empty
                    obj[item.key.trim()] = item.value.trim();
                }
                return obj;
            }, {});
            formData.append('specifications', JSON.stringify(specsObject));

            // append images to formData
            Object.keys(images).forEach((key) => {

                images[key] && formData.append('images', images[key])

            })
            const token = await getToken()
            const { data } = await axios.post('/api/store/product', formData, {headers: {
                Authorization: `Bearer ${token}`
            }})
            toast.success(data.message)

            //reset form
            setProductInfo({
                name: "",
                description: "",
                mrp: 0,
                price: 0,
                category: "",
            })
            setImages({ 1: null, 2: null, 3: null, 4: null })
            setSpecifications([{ key: '', value: '' }])
            } catch (error) {
                toast.error(error?.response?.data?.error || error.message)
            } finally {
                setLoading(false)
            }
        }

    return (
        <form onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Adding Product..." })} className="text-slate-500 mb-28">
            <h1 className="text-2xl">Add New <span className="text-slate-800 font-medium">Products</span></h1>
            <p className="mt-7">Product Images</p>

            <div htmlFor="" className="flex gap-3 mt-4">
                {Object.keys(images).map((key) => (
                    <label key={key} htmlFor={`images${key}`}>
                        <Image width={300} height={300} className='h-15 w-auto border border-slate-200 rounded cursor-pointer' src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} alt="" />
                        <input type="file" accept='image/*' id={`images${key}`} onChange={e => setImages({ ...images, [key]: e.target.files[0] })} hidden />
                    </label>
                ))}
            </div>

            <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                Name
                <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Enter product name" className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded" required />
            </label>

            <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                Description
                <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Enter product description" rows={5} className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
            </label>

            <div className="flex gap-5">
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Actual Price ($)
                    <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="0" rows={5} className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Offer Price ($)
                    <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0" rows={5} className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>
            </div>

            <select onChange={e => setProductInfo({ ...productInfo, category: e.target.value })} value={productInfo.category} className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded" required>
                <option value="">Select a category</option>
                {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>

            {/* --- Specifications Section --- */}
            <div className="my-8">
                <h3 className="text-lg mb-4">Product Specifications</h3>
                <div className="flex flex-col gap-3 max-w-xl">
                    {specifications.map((spec, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                name="key"
                                placeholder="e.g., Brand"
                                value={spec.key}
                                onChange={event => handleSpecChange(index, event)}
                                className="border p-2 px-4 rounded w-1/3 outline-none focus:border-slate-400"
                            />
                            <input
                                type="text"
                                name="value"
                                placeholder="e.g., Apple"
                                value={spec.value}
                                onChange={event => handleSpecChange(index, event)}
                                className="border p-2 px-4 rounded flex-1 outline-none focus:border-slate-400"
                            />
                            <button type="button" onClick={() => removeSpecField(index)} className="text-red-500 hover:text-red-700 font-medium text-xs">REMOVE</button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addSpecField} className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add Specification</button>
            </div>

            <br />

            <button disabled={loading} className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition">Add Product</button>
        </form>
    )
}