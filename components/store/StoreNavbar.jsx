'use client'
import React from 'react'
import { UserButton } from '@clerk/nextjs'
import { Menu } from 'lucide-react'

const StoreNavbar = () => {
    return (
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 -ml-2 text-slate-600">
                    <Menu size={24} />
                </button>
                <h1 className="font-bold text-xl text-slate-900">GoCart Store</h1>
            </div>
            <UserButton afterSignOutUrl="/"/>
        </div>
    )
}

export default StoreNavbar
