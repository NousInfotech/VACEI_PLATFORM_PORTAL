import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import VerifyMFA from './pages/auth/VerifyMFA'
import ForgetPassword from './pages/auth/ForgetPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/common/Dashboard'
import MainLayout from './layout/MainLayout'
import NotFound from './pages/common/NotFound'
import { AuthProvider } from './context/AuthContext'
import Organizations from './pages/platform-admin/organization/Organizations'
import CreateOrganization from './pages/platform-admin/organization/CreateOrganization'
import EditOrganization from './pages/platform-admin/organization/EditOrganization'
import ViewOrganization from './pages/platform-admin/organization/ViewOrganization'
import ServiceRequestTemplates from './pages/platform-admin/services/servicesRequestTemplates/ServiceRequestTemplates'
import CreateTemplate from './pages/platform-admin/services/servicesRequestTemplates/CreateTemplate'
import ViewTemplate from './pages/platform-admin/services/servicesRequestTemplates/ViewTemplate'
import ServiceRequestManagement from './pages/platform-admin/services/servicesRequestManagement/ServiceRequestManagement'
import ViewServiceRequest from './pages/platform-admin/services/servicesRequestManagement/ViewServiceRequest'
import IncorpCycleRedirector from './pages/platform-admin/services/servicesRequestManagement/components/IncorpCycleRedirector'
import ServicesManagement from './pages/platform-admin/services/servicesManagement/ServicesManagement'
import TemplatePreview from './pages/platform-admin/services/servicesRequestTemplates/TemplatePreview'
import Clients from './pages/platform-admin/clients/Clients'
import CreateClient from './pages/platform-admin/clients/CreateClient'
import ViewClient from './pages/platform-admin/clients/ViewClient'
import ViewCompany from './pages/platform-admin/clients/view-company/ViewCompany'
import IncorpCycle from './pages/platform-admin/clients/IncorpCycle'
import KycPage from './pages/platform-admin/clients/KycPage'
import GlobalLibrary from './pages/platform-admin/global-library/GlobalLibrary'
import Settings from './pages/platform-admin/settings/Settings'
import Messages from './pages/messages/Messages'
import Employees from './pages/platform-admin/employees/Employees'
import CreatePlatformEmployee from './pages/platform-admin/employees/CreatePlatformEmployee'
import Notifications from './pages/common/Notifications'
import NotificationSettings from './pages/common/NotificationSettings'

import EngagementsList from './pages/platform-admin/engagements/EngagementsList'
import CreateEngagementPage from './pages/platform-admin/services/servicesRequestManagement/CreateEngagementPage'
import NoticeManagement from './pages/platform-admin/notice-management/NoticeManagement'
import CreateNotice from './pages/platform-admin/notice-management/CreateNotice'
import EditNotice from './pages/platform-admin/notice-management/EditNotice'
import ProcedurePromptList from './pages/platform-admin/procedure-prompt/ProcedurePromptList'
import CreateProcedurePrompt from './pages/platform-admin/procedure-prompt/CreateProcedurePrompt'
import EditProcedurePrompt from './pages/platform-admin/procedure-prompt/EditProcedurePrompt'
import ViewProcedurePrompt from './pages/platform-admin/procedure-prompt/ViewProcedurePrompt'
import CreateComplianceCalendarPage from './pages/platform-admin/compliance-calendar/CreateComplianceCalendarPage'
import EditComplianceCalendarPage from './pages/platform-admin/compliance-calendar/EditComplianceCalendarPage'
import TemplateManagement from './pages/platform-admin/template-management/TemplateManagement'
import CreateTemplateForm from './pages/platform-admin/template-management/CreateTemplateForm'
import TicketManagement from './pages/platform-admin/ticket-management/TicketManagement'
import TicketDetailPage from './pages/platform-admin/ticket-management/TicketDetailPage'
import EditTemplateForm from './pages/platform-admin/template-management/EditTemplateForm'
import ViewTemplateDetail from './pages/platform-admin/template-management/ViewTemplateDetail'
import { Toaster } from 'sonner'

const App = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" expand={true} richColors={true} />
      <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-mfa" element={<VerifyMFA />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard/service-request-management" element={<ServiceRequestManagement />} />
          <Route path="/dashboard/service-request-management/:id" element={<ViewServiceRequest />} />
          <Route path="/dashboard/service-request-management/:id/incorporation-cycle" element={<IncorpCycleRedirector />} />
          <Route path="/dashboard/service-request-templates" element={<ServiceRequestTemplates />} />
          <Route path="/dashboard/service-request-templates/create" element={<CreateTemplate />} />
          <Route path="/dashboard/service-request-templates/:id/view" element={<ViewTemplate />} />
          <Route path="/dashboard/services-management" element={<ServicesManagement />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/companies" element={<Dashboard activeSection="Companies" />} />
          <Route path="/dashboard/engagements" element={<EngagementsList />} />
          <Route path="/dashboard/engagements/create" element={<CreateEngagementPage />} />
          <Route path="/dashboard/compliance" element={<Dashboard activeSection="Compliance" />} />
          <Route path="/dashboard/compliance/create" element={<CreateComplianceCalendarPage />} />
          <Route path="/dashboard/compliance/:id/edit" element={<EditComplianceCalendarPage />} />
          <Route path="/dashboard/templates" element={<Dashboard activeSection="Document Request Templates" />} />

          <Route path="/dashboard/organizations" element={<Organizations />} />
          <Route path="/dashboard/organizations/create" element={<CreateOrganization />} />
          <Route path="/dashboard/organizations/:id" element={<ViewOrganization />} />
          <Route path="/dashboard/organizations/:id/edit" element={<EditOrganization />} />
          <Route path="/dashboard/clients" element={<Clients />} />
          <Route path="/dashboard/clients/create" element={<CreateClient />} />
          <Route path="/dashboard/clients/:clientId" element={<ViewClient />} />
          <Route path="/dashboard/clients/:clientId/company/:companyId" element={<ViewCompany />} />
          <Route path="/dashboard/clients/:clientId/company/:companyId/incorporation-cycle" element={<IncorpCycle />} />
          <Route path="/dashboard/clients/:clientId/company/:companyId/kyc" element={<KycPage />} />
          <Route path="/dashboard/employees" element={<Employees />} />
          <Route path="/dashboard/employees/create" element={<CreatePlatformEmployee />} />
          <Route path="/dashboard/global-library" element={<GlobalLibrary />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/notification-settings" element={<NotificationSettings />} />
          <Route path="/dashboard/messages" element={<Messages />} />
          <Route path="/dashboard/notifications" element={<Notifications />} />
          <Route path="/dashboard/notice-management" element={<NoticeManagement />} />
          <Route path="/dashboard/notice-management/create" element={<CreateNotice />} />
          <Route path="/dashboard/notice-management/:id/edit" element={<EditNotice />} />
          <Route path="/dashboard/procedure-prompts" element={<ProcedurePromptList />} />
          <Route path="/dashboard/procedure-prompts/create" element={<CreateProcedurePrompt />} />
          <Route path="/dashboard/procedure-prompts/:id" element={<ViewProcedurePrompt />} />
          <Route path="/dashboard/procedure-prompts/:id/edit" element={<EditProcedurePrompt />} />
          <Route path="/dashboard/template-management" element={<TemplateManagement />} />
          <Route path="/dashboard/template-management/create" element={<CreateTemplateForm />} />
          <Route path="/dashboard/template-management/:id/view" element={<ViewTemplateDetail />} />
          <Route path="/dashboard/template-management/:id/edit" element={<EditTemplateForm />} />
          <Route path="/dashboard/ticket-management" element={<TicketManagement />} />
          <Route path="/dashboard/ticket-management/:ticketId" element={<TicketDetailPage />} />
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