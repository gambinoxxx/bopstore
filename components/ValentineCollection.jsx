'use client'
import React, { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import ProductCard from './ProductCard'
import Title from './Title'
import Loading from './Loading'
import { useDispatch } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'

const ValentineCollection = ({ gender }) => {

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedPackage, setSelectedPackage] = useState(null)
    
    // Wizard state
    const [wizardStep, setWizardStep] = useState(0)
    const [bundleItems, setBundleItems] = useState({ shirt: null, wallet: null, belt: null })

    const dispatch = useDispatch()
    const router = useRouter()

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('/api/products')
                setProducts(data.products)
            } catch (error) {
                console.error("Failed to fetch products", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    const packages = [
        { label: '₦50,000 Package', min: 0, max: 50000 },
        { label: '₦100,000 Package', min: 80000, max: 100000 },
        { label: '₦150,000 Package', min: 100000, max: 150000 },
        { label: '₦200,000 Package', min: 150000, max: 200000 },
    ]

    const packageConfigs = useMemo(() => ({
        '₦50,000 Package': ['shirt', 'wallet', 'belt'],
        '₦100,000 Package': ['shirt', 'wallet', 'belt', 'fragrances'],
        '₦150,000 Package': ['shirt', 'shoe', 'wallet', 'clipper'],
        '₦200,000 Package': ['shirt', 'shoe', 'watch'],
    }), [])

    const handlePackageSelect = (pkg) => {
        setSelectedPackage(pkg)
        if (gender === 'men' && pkg?.label && packageConfigs[pkg.label]) {
            setWizardStep(1)
            setBundleItems({})
        } else {
            setWizardStep(0)
        }
    }

    const filteredProducts = useMemo(() => {
        if (wizardStep > 0) return [] // Handled by wizard logic

        // Filter by gender first
        let filtered = products.filter(p => {
            const lowerCategory = p.category.toLowerCase();
            const lowerName = p.name.toLowerCase();
            
            if (gender === 'men') {
                // Exclude women's items
                if (lowerCategory.includes('women') || lowerCategory.includes('female') || 
                    lowerName.includes('women') || lowerName.includes('female')) {
                    return false;
                }
                return true;
            } else {
                // Exclude men's items
                if (lowerCategory.includes("men's") || lowerCategory.includes('male') || 
                    lowerName.includes("men's") || lowerName.includes('male')) {
                    return false;
                }
                // Check for 'men' but ensure it's not part of 'women'
                if ((lowerCategory.includes('men') && !lowerCategory.includes('women')) || 
                    (lowerName.includes('men') && !lowerName.includes('women'))) {
                    return false;
                }
                return true;
            }
        })

        // Filter by price package
        if (selectedPackage) {
            filtered = filtered.filter(p => p.price >= selectedPackage.min && p.price <= selectedPackage.max)
        }

        return filtered
    }, [products, gender, selectedPackage])

    const getWizardProducts = () => {
        const steps = selectedPackage ? packageConfigs[selectedPackage.label] : []
        const term = steps ? steps[wizardStep - 1] : ''
        if (!term) return []
        return products.filter(p => {
            const lowerCategory = p.category.toLowerCase();
            const lowerName = p.name.toLowerCase();

            let isGenderMatch = true;
            if (gender === 'men') {
                if (lowerCategory.includes('women') || lowerCategory.includes('female') || 
                    lowerName.includes('women') || lowerName.includes('female')) {
                    isGenderMatch = false;
                }
            } else {
                if (lowerCategory.includes("men's") || lowerCategory.includes('male') || 
                    lowerName.includes("men's") || lowerName.includes('male')) {
                    isGenderMatch = false;
                }
                if ((lowerCategory.includes('men') && !lowerCategory.includes('women')) || 
                    (lowerName.includes('men') && !lowerName.includes('women'))) {
                    isGenderMatch = false;
                }
            }

            const isItemMatch = lowerCategory.includes(term) || lowerName.includes(term);
            return isGenderMatch && isItemMatch;
        })
    }

    const handleItemSelect = (product) => {
        const steps = selectedPackage ? packageConfigs[selectedPackage.label] : []
        const term = steps ? steps[wizardStep - 1] : ''
        
        const newBundle = { ...bundleItems }
        if (term) newBundle[term] = product
        
        setBundleItems(newBundle)
        setWizardStep(prev => prev + 1)
    }

    const handleAddToCartBundle = () => {
        Object.values(bundleItems).forEach(item => {
            if (item) dispatch(addToCart({ productId: item.id }))
        })
        toast.success(`${selectedPackage?.label} added to cart!`)
        router.push('/cart')
    }

    if (loading) return <Loading />

    const maxSteps = selectedPackage && packageConfigs[selectedPackage.label] ? packageConfigs[selectedPackage.label].length : 0;
    const currentStepTerm = selectedPackage && packageConfigs[selectedPackage.label] ? packageConfigs[selectedPackage.label][wizardStep - 1] : '';

    return (
        <div className='px-6 my-20 max-w-6xl mx-auto'>
            <Title title={`Valentine's Collection for ${gender === 'men' ? 'Him' : 'Her'}`} description="Select a package to view curated gifts." />
            
            <div className='flex flex-wrap justify-center gap-4 my-10'>
                {packages.map((pkg, index) => (
                    <button 
                        key={index}
                        onClick={() => handlePackageSelect(pkg)}
                        className={`px-6 py-2 rounded-full border text-sm font-medium transition-colors ${selectedPackage === pkg ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'}`}
                    >
                        {pkg.label}
                    </button>
                ))}
            </div>

            {wizardStep > 0 && wizardStep <= maxSteps && (
                <div className='mb-10'>
                    <h3 className='text-2xl font-semibold text-center mb-6 text-slate-700'>
                        Step {wizardStep}: Choose a <span className="capitalize">{currentStepTerm}</span>
                    </h3>
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                        {getWizardProducts().map((product, index) => (
                            <ProductCard key={index} product={product} disableLink={true} onClick={handleItemSelect} />
                        ))}
                        {getWizardProducts().length === 0 && (
                             <div className='col-span-full text-center py-10 text-slate-500'>
                                <p>No items found for this step.</p>
                                <button onClick={() => setWizardStep(prev => prev + 1)} className='mt-4 text-blue-500 underline'>Skip Step</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {wizardStep === maxSteps + 1 && (
                <div className='max-w-2xl mx-auto bg-slate-50 p-8 rounded-xl border border-slate-200'>
                    <h3 className='text-2xl font-semibold text-center mb-8 text-slate-700'>Your {selectedPackage?.label}</h3>
                    <div className='space-y-4'>
                        {Object.entries(bundleItems).map(([key, item]) => item && (
                            <div key={key} className='flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm'>
                                <Image src={item.images[0]} alt={item.name} width={60} height={60} className='object-cover rounded' />
                                <div>
                                    <p className='font-medium capitalize'>{key}</p>
                                    <p className='text-sm text-slate-600'>{item.name}</p>
                                </div>
                            </div>
                        ))}
                        <div className='flex items-center gap-4 bg-red-50 p-4 rounded-lg border border-red-100'>
                            <div className='w-[60px] h-[60px] bg-red-100 flex items-center justify-center rounded text-2xl'>🎁</div>
                            <div>
                                <p className='font-medium text-red-600'>Valentine Gift</p>
                                <p className='text-sm text-slate-600'>Wine & Chocolate (Complimentary)</p>
                            </div>
                        </div>
                    </div>
                    <div className='mt-8 text-center'>
                        <p className='text-xl font-bold text-slate-800 mb-4'>Total: {selectedPackage?.label.split(' ')[0]}</p>
                        <button onClick={handleAddToCartBundle} className='bg-red-600 text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors w-full sm:w-auto'>
                            Proceed to Cart
                        </button>
                        <button onClick={() => setWizardStep(1)} className='block mx-auto mt-4 text-sm text-slate-500 hover:text-slate-700'>
                            Start Over
                        </button>
                    </div>
                </div>
            )}

            {wizardStep === 0 && (
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                            <ProductCard key={index} product={product} />
                        ))
                    ) : (
                        <div className='col-span-full text-center py-20 text-slate-500'>
                            <p>No gifts found for this package.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ValentineCollection
