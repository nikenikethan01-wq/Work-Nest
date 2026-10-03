import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AuthRequired from './components/authentication/AuthRequired'
import UserLayout from './components/layout/UserLayout'
import ClientRequired from './components/authentication/ClientRequired'
import ClientDashboard from './pages/client/Dashboard/ClientDashboard'
import ClientJobs from './pages/client/Jobs/ClientJobs'
import ClientJobDetails from './pages/client/Jobs/ClientJobDetails'
import ClientCreateJob from './pages/client/Jobs/ClientCreateJob'
import ClientUpdateJob from './pages/client/Jobs/ClientUpdateJob'
import ClientProjects from './pages/client/Projects/ClientProjects'
import ClientProjectDetails from './pages/client/Projects/ClientProjectDetails'
import ClientApplications from './pages/client/Applications/ClientApplications'
import ClientProfile from './pages/client/ClientProfile'
import ViewProfile from './pages/ViewProfile'
import FreelancerRequired from './components/authentication/FreelancerRequired'
import FreelancerDashboard from './pages/freelancer/Dashboard/FreelancerDashboard'
import FreelancerJobs from './pages/freelancer/Jobs/FreelancerJobs'
import FreelancerApplications from './pages/freelancer/Applications/FreelancerApplications'
import FreelancerProjects from './pages/freelancer/Projects/FreelancerProjects'
import FreelancerProfile from './pages/freelancer/FreelancerProfile'
import FreelancerApplyJob from './pages/freelancer/Jobs/FreelancerApplyJob'
import FreelancerProjectDetails from './pages/freelancer/Projects/FreelancerProjectDetails'
import FreelancerApplicationDetails from './pages/freelancer/Applications/FreelancerApplicationDetails'
import Chat from './components/layout/Chat'
import Conversation from './pages/chat/Conversation'
import ChatEmpty from './pages/chat/ChatEmpty'
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />

          <Route path="register" element={<Register />} />
          <Route element={<AuthRequired />}>
            <Route element={<UserLayout />}>
              // CHAT
              <Route path="chat" element={<Chat />}>
                <Route index element={<ChatEmpty />} />
                <Route path=":conversationId" element={<Conversation />} />
              </Route>
              // CLIENT
              <Route path="client" element={<ClientRequired />}>
                <Route index element={<ClientDashboard />} />
                <Route path="jobs" element={<ClientJobs />} />
                <Route
                  path="jobs/:jobId/details"
                  element={<ClientJobDetails />}
                />
                <Route path="jobs/create" element={<ClientCreateJob />} />
                <Route
                  path="jobs/:jobId/update"
                  element={<ClientUpdateJob />}
                />
                <Route path="projects" element={<ClientProjects />} />
                <Route
                  path="projects/:projectId"
                  element={<ClientProjectDetails />}
                />
                <Route path="applications" element={<ClientApplications />} />
                <Route path="freelancers/:userId" element={<ViewProfile />} />
                <Route path="profile/:userId" element={<ClientProfile />} />
              </Route>
              //FREELANCER
              <Route path="freelancer" element={<FreelancerRequired />}>
                <Route index element={<FreelancerDashboard />} />
                <Route path="jobs" element={<FreelancerJobs />} />
                <Route
                  path="applications"
                  element={<FreelancerApplications />}
                />
                <Route path="jobs/:id/apply" element={<FreelancerApplyJob />} />
                <Route path="projects" element={<FreelancerProjects />} />
                <Route
                  path="projects/:projectId/details"
                  element={<FreelancerProjectDetails />}
                />
                <Route path="clients/:userId" element={<ViewProfile />} />
                <Route
                  path="applications/:jobId"
                  element={<FreelancerApplicationDetails />}
                />
                <Route path="profile/:userId" element={<FreelancerProfile />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
