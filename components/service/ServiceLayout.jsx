'use client'

import DashboardLayout from '@/components/DashboardLayout'
import ServiceNavbar from './ServiceNavbar'
import ServiceSidebar from './ServiceSidebar'

const ServiceLayout = ({ children }) => {
    return (
        <DashboardLayout
            apiEndpoint="/api/service/is-provider"
            roleKey="isProvider"
            infoKey="serviceInfo"
            Navbar={ServiceNavbar}
            Sidebar={ServiceSidebar}
        >
            {children}
        </DashboardLayout>
    )
}

export default ServiceLayout
