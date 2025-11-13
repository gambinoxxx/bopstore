'use client'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'

const Title = ({ title, description, href = '/shop', visibleButton = true, icon }) => {
    return (
        <div className='flex flex-col items-center text-center'>
            <div className='flex items-center gap-3'>
                <h2 className='text-2xl sm:text-3xl font-medium text-slate-800'>{title}</h2>
                {icon && <span className="flex items-center justify-center">{icon}</span>}
                {visibleButton && <Link href={href} className='bg-slate-100 p-2 rounded-full hover:bg-slate-200 active:scale-95 transition'><ArrowRightIcon size={16} /></Link>}
            </div>
            <p className='text-slate-500 mt-2 max-w-xl'>{description}</p>
        </div>
    )
}

export default Title