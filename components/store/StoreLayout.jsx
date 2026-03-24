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

    // Allow create page without auth restriction
    if (pathname?.includes('/create')) {
        return <div className="min-h-screen bg-slate-50">{children}</div>
    }

    // Redirect if user has no store
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
            apiEndpoint="/api/store/is-seller"
            roleKey="isSeller"
            infoKey="storeInfo"
            Navbar={StoreNavbar}
            Sidebar={StoreSidebar}
        >
            {children}
        </DashboardLayout>
    )
}

export default StoreLayout
