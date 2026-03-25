'use client'

import React from 'react'
import { useClerk } from '@clerk/nextjs'
import { HomeIcon, SquarePlusIcon, SquarePenIcon, LayoutListIcon, LogOut } from 'lucide-react'
import Image from 'next/image'
import clsx from 'clsx'

const StoreSidebar = ({ info, closeSidebar }) => {
    const { signOut } = useClerk()

    const navItems = [
        { name: 'Dashboard', href: '/store', icon: HomeIcon },
        { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
        { name: 'Manage Product', href: '/store/manage-product', icon: SquarePenIcon },
        { name: 'Orders', href: '/store/orders', icon: LayoutListIcon },
    ]

    const handleClick = (href) => {
        if (closeSidebar) closeSidebar() // auto-close on mobile
        window.location.href = href
    }

    return (
        <div className="w-64 h-full bg-white border-r border-slate-200 flex flex-col p-6">
            {/* Store Info */}
            <div className="flex items-center gap-3 mb-10">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100">
                    {info?.logo ? (
                        <Image src={info.logo} alt={info?.name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-slate-200" />
                    )}
                </div>
                <div>
                    <h2 className="font-bold text-sm">{info?.name}</h2>
                    <p className="text-xs text-slate-500">Manage your store</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
                {navItems.map((item) => (
                    <button
                        key={item.href}
                        onClick={() => handleClick(item.href)}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left",
                            window.location.pathname.startsWith(item.href)
                                ? "bg-slate-900 text-white"
                                : "text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                    </button>
                ))}
            </nav>

            {/* Sign Out */}
            <button
                onClick={() => { signOut(); closeSidebar && closeSidebar() }}
                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl mt-auto text-sm"
            >
                <LogOut size={20} />
                Sign Out
            </button>
        </div>
    )
}

export default StoreSidebar
