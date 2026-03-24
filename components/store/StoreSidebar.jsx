'use client'
import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Settings, LogOut } from 'lucide-react'
import { useClerk } from '@clerk/nextjs'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const StoreSidebar = ({ info }) => {
    const { signOut } = useClerk()
    const pathname = usePathname()

    const navItems = [
        { label: 'Overview', href: '/store', icon: LayoutDashboard },
        { label: 'Products', href: '/store/products', icon: ShoppingBag },
        { label: 'Settings', href: '/store/settings', icon: Settings },
    ]

    return (
        <div className="w-64 h-full bg-white border-r border-slate-200 hidden lg:flex flex-col p-6">
            <div className="flex items-center gap-3 mb-10">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
                    {info?.logo ? (
                        <Image src={info.logo} alt={info.name || 'Store'} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-slate-200" />
                    )}
                </div>
                <div className="overflow-hidden">
                    <h2 className="font-bold text-slate-900 text-sm truncate">{info?.name || 'Store Dashboard'}</h2>
                    <p className="text-xs text-slate-500 truncate">Manage your store</p>
                </div>
            </div>

            <nav className="space-y-1 flex-1">
                {navItems.map((item) => (
                    <Link 
                        key={item.href} 
                        href={item.href} 
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm",
                            pathname === item.href ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <button onClick={() => signOut()} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-auto w-full text-sm font-medium">
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
        </div>
    )
}

export default StoreSidebar