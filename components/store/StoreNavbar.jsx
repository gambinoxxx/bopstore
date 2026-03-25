'use client'

import { useUser, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Menu } from "lucide-react"

const StoreNavbar = ({ onMenuClick }) => {

    const { user } = useUser()

    return (
        <div className="flex items-center justify-between px-4 lg:px-12 py-3 border-b border-slate-200 transition-all">

            {/* ✅ LEFT SECTION (Menu + Logo) */}
            <div className="flex items-center gap-3">

                {/* ✅ Mobile Menu Button */}
                <button onClick={onMenuClick} className="lg:hidden">
                    <Menu size={24} />
                </button>

                {/* Logo (unchanged styling) */}
                <Link href="/" className="relative text-2xl lg:text-4xl font-semibold text-slate-700">
                    <span className="text-green-600">Bop</span>store
                    <span className="text-green-600 text-3xl lg:text-5xl leading-0">.</span>

                    <p className="absolute text-xs font-semibold -top-1 -right-11 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                        Store
                    </p>
                </Link>
            </div>

            {/* ✅ RIGHT SECTION (User) */}
            <div className="flex items-center gap-3">
                <p className="hidden sm:block">Hi, {user?.firstName}</p>
                <UserButton />
            </div>

        </div>
    )
}

export default StoreNavbar
