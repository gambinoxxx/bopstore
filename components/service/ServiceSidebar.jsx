'use client'

import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon, SettingsIcon } from 'lucide-react'
import Image from 'next/image'
import clsx from 'clsx'

const ServiceSidebar = ({ info, closeSidebar }) => {

    const sidebarLinks = [
        { name: 'Dashboard', href: '/service', icon: HomeIcon },
        { name: 'Add Service', href: '/service/add-service', icon: SquarePlusIcon },
        { name: 'Manage Services', href: '/service/manage-service', icon: SquarePenIcon },
        { name: 'Orders', href: '/service/orders', icon: LayoutListIcon },
        { name: 'Settings', href: '/service/settings', icon: SettingsIcon },
    ]

    const handleClick = (href) => {
        if (closeSidebar) closeSidebar() // auto-close on mobile
        window.location.href = href
    }

    return (
        <div className="w-64 h-full bg-white border-r border-slate-200 flex flex-col p-6">
            {/* Service Info */}
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
                    <p className="text-xs text-slate-500">Manage your services</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
                {sidebarLinks.map((link) => (
                    <button
                        key={link.href}
                        onClick={() => handleClick(link.href)}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left",
                            window.location.pathname.startsWith(link.href)
                                ? "bg-blue-600 text-white"
                                : "text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        <link.icon size={20} />
                        <span>{link.name}</span>
                    </button>
                ))}
            </nav>
        </div>
    )
}

export default ServiceSidebar
