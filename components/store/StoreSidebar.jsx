'use client'

import React from 'react'
import Link from 'next/link'
import {
    HomeIcon,
    SquarePlusIcon,
    SquarePenIcon,
    LayoutListIcon,
    LogOut
} from 'lucide-react'
import { useClerk } from '@clerk/nextjs'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const StoreSidebar = ({ info }) => {
    const { signOut } = useClerk()
    const pathname = usePathname()

    const navItems = [
        { name: 'Dashboard', href: '/store', icon: HomeIcon },
        { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
        { name: 'Manage Product', href: '/store/manage-product', icon: SquarePenIcon },
        { name: 'Orders', href: '/store/orders', icon: LayoutListIcon },
    ]

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
                    <h2 className="font-bold text-sm truncate">{info?.name}</h2>
                    <p className="text-xs text-slate-500">Manage your store</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                            pathname === item.href || pathname.startsWith(item.href + '/')
                                ? "bg-slate-900 text-white"
                                : "text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Sign Out */}
            <button
                onClick={() => signOut()}
                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl mt-auto text-sm transition-colors"
            >
                <LogOut size={20} />
                Sign Out
            </button>
        </div>
    )
}

export default StoreSidebar
