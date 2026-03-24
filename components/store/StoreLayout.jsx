'use client'
import DashboardLayout from '@/components/DashboardLayout'
import StoreNavbar from './StoreNavbar'
import StoreSidebar from './StoreSidebar'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'

const StoreLayout = ({ children }) => {
    const pathname = usePathname()
    const router = useRouter()
    const { getToken } = useAuth()

    // Bypass the dashboard layout (and its API check) for the create store page
    if (pathname?.includes('/create')) {
        return <div className="min-h-screen bg-slate-50">{children}</div>
    }

    // Check if store exists, if not redirect to create
    useEffect(() => {
        const checkStore = async () => {
            try {
                const token = await getToken()
                await axios.get('/api/store', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            } catch (error) {
                if (error.response?.status === 404) {
                    router.push('/create-store')
                }
            }
        }
        checkStore()
    }, [router, getToken])

    return (
        <DashboardLayout
            apiEndpoint="/api/store"
            roleKey="isStore"
            infoKey="store"
            Navbar={StoreNavbar}
            Sidebar={StoreSidebar}
        >
            {children}
        </DashboardLayout>
    )
}

export default StoreLayout