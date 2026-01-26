import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import ForgetPassword from './pages/auth/ForgetPassword'
import Dashboard from './pages/common/Dashboard'
import MainLayout from './layout/MainLayout'
import NotFound from './pages/common/NotFound'
import { AuthProvider } from './context/AuthContext'
import Organizations from './pages/platform-admin/organization/Organizations'
import CreateOrganization from './pages/platform-admin/organization/CreateOrganization'
import EditOrganization from './pages/platform-admin/organization/EditOrganization'
import ServiceRequestTemplates from './pages/platform-admin/services/servicesRequestTemplates/ServiceRequestTemplates'
import CreateTemplate from './pages/platform-admin/services/servicesRequestTemplates/CreateTemplate'
import ViewTemplate from './pages/platform-admin/services/servicesRequestTemplates/ViewTemplate'
import ServiceRequestManagement from './pages/platform-admin/services/servicesRequestManagement/ServiceRequestManagement'
import ViewServiceRequest from './pages/platform-admin/services/servicesRequestManagement/ViewServiceRequest'
import TemplatePreview from './pages/platform-admin/services/servicesRequestTemplates/TemplatePreview'

const App = () => {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard/service-request-management" element={<ServiceRequestManagement />} />
          <Route path="/dashboard/service-request-management/:id" element={<ViewServiceRequest />} />
          <Route path="/dashboard/service-request-templates" element={<ServiceRequestTemplates />} />
          <Route path="/dashboard/service-request-templates/create" element={<CreateTemplate />} />
          <Route path="/dashboard/service-request-templates/:id/view" element={<ViewTemplate />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/companies" element={<Dashboard activeSection="Companies" />} />
          <Route path="/dashboard/engagements" element={<Dashboard activeSection="Engagements" />} />
          <Route path="/dashboard/compliance" element={<Dashboard activeSection="Compliance" />} />
          <Route path="/dashboard/templates" element={<Dashboard activeSection="Document Request Templates" />} />
          <Route path="/dashboard/settings" element={<Dashboard activeSection="Settings" />} />
          <Route path="/dashboard/organizations" element={<Organizations />} />
          <Route path="/dashboard/organizations/create" element={<CreateOrganization />} />
          <Route path="/dashboard/organizations/:id/edit" element={<EditOrganization />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/dashboard/service-request-templates/:id/preview" element={<TemplatePreview />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
    </AuthProvider>
  )
}

export default App