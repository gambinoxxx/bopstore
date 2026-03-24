'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import Loading from "./Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { useAuth, useUser } from "@clerk/nextjs"

const DashboardLayout = ({ children, apiEndpoint, roleKey, infoKey, Navbar, Sidebar }) => {
    const { getToken } = useAuth()
    const { isLoaded } = useUser()

    const [hasRole, setHasRole] = useState(false)
    const [loading, setLoading] = useState(true)
    const [entityInfo, setEntityInfo] = useState(null)

    useEffect(() => {
        if (!isLoaded) return

        const fetchRole = async () => {
            setLoading(true)
            try {
                const token = await getToken()
                const { data } = await axios.get(apiEndpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                // Ensure role is a Boolean
                setHasRole(Boolean(data?.[roleKey]))
                setEntityInfo(data?.[infoKey] || null)
            } catch (error) {
                console.error("DASHBOARD_LAYOUT_FETCH_ERROR:", error)
                setHasRole(false)
                setEntityInfo(null)
            } finally {
                setLoading(false)
            }
        }

        fetchRole()
    }, [isLoaded, getToken, apiEndpoint, roleKey, infoKey])

    if (loading) return <Loading />

    if (!hasRole) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">
                    You are not authorized to access this page
                </h1>
                <Link
                    href="/"
                    className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full"
                >
                    Go to home <ArrowRightIcon size={18} />
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <Sidebar info={entityInfo || {}} />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout
