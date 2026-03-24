import DashboardLayout from '@/components/DashboardLayout'
import ServiceNavbar from '@/components/service/ServiceNavbar'
import ServiceSidebar from '@/components/service/ServiceSidebar'

export default function Layout({ children }) {
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