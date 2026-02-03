'use client'
import Title from './Title'
import Link from 'next/link'
import Image from 'next/image'
import { assets } from '@/assets/assets'

const BestSelling = () => {

    return (
        <div className='bg-red-50 py-20 my-20'>
            <div className='px-6 max-w-6xl mx-auto'>
                <Title title='Valentine Special' description='Find the perfect gift for your loved ones.' href='/shop' />
                <div className='mt-12 grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <Link href='/valentine/women' className='relative h-[400px] rounded-xl overflow-hidden group cursor-pointer'>
                        <Image src={assets.img1} alt="For Her" fill className='object-cover group-hover:scale-105 transition-transform duration-500' />
                        <div className='absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center'>
                            <h3 className='text-white text-4xl font-bold tracking-wider'>FOR HER</h3>
                        </div>
                    </Link>
                    <Link href='/valentine/men' className='relative h-[400px] rounded-xl overflow-hidden group cursor-pointer'>
                        <Image src={assets.img2} alt="For Him" fill className='object-cover group-hover:scale-105 transition-transform duration-500' />
                        <div className='absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center'>
                            <h3 className='text-white text-4xl font-bold tracking-wider'>FOR HIM</h3>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default BestSelling