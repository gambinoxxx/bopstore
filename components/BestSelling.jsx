'use client'
import React from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import Link from 'next/link'

const BestSelling = () => {
    return (
        <div className='my-20 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-7xl mx-auto rounded-3xl bg-[#B9F8CF] relative overflow-hidden flex flex-col-reverse md:flex-row items-center'>
                {/* Text Content */}
                <div className='p-8 sm:p-12 lg:p-16 space-y-6 text-center md:text-left w-full md:w-1/2'>
                    <div>
                        <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight'>Need a service provider?</h2>
                        <p className='text-xl md:text-2xl text-slate-600 mt-2'>we’ve got you covered.</p>
                    </div>
                    <div className='pt-4'>
                        <p className='text-base text-slate-600'>starts from</p>
                        <p className='text-3xl lg:text-4xl font-bold text-slate-900'>₦4,000</p>
                    </div>
                    <Link href='/services' className='inline-block w-full sm:w-auto px-10 py-4 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors active:scale-95 text-center'>
                        Connect Now
                    </Link>
                </div>

                {/* Image */}
                <div className='relative w-full md:w-1/2 h-64 md:h-96 lg:h-[480px]'>
                    <Image
                        src={assets.img7} // Assuming this asset exists and is suitable
                        alt="A person receiving a service"
                        fill
                        className='object-cover'
                    />
                </div>
            </div>
        </div>
    )
}

export default BestSelling