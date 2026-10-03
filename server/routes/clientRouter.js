import express from 'express'
import {
  createJob,
  getAllJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobApplications,
  acceptApplication,
  rejectApplications,
  getMyProjects,
  getProjectWithID,
  completeProject,
  getClientDashboard,
  getMyApplications,
  getMyProfile,
  getFreelancerProfile,
} from '../controller/clientController.js'
import { requireAuth, requireClient } from '../middleware/middleware.js'

const clientRouter = express.Router()

clientRouter.post('/jobs/createjob', requireAuth, requireClient, createJob)
clientRouter.get('/jobs', requireAuth, requireClient, getAllJobs)
clientRouter.get('/jobs/my', requireAuth, requireClient, getMyJobs)
clientRouter.get('/jobs/:jobId', requireAuth, requireClient, getJobById)
clientRouter.put('/jobs/:jobId', requireAuth, requireClient, updateJob)
clientRouter.delete('/jobs/:jobId', requireAuth, requireClient, deleteJob)
clientRouter.get(
  '/jobs/:jobId/applications',
  requireAuth,
  requireClient,
  getJobApplications,
)
clientRouter.patch(
  '/applications/:jobId/:freelancerId/accept',
  requireAuth,
  requireClient,
  acceptApplication,
)
clientRouter.patch(
  '/applications/:jobId/:freelancerId/reject',
  requireAuth,
  requireClient,
  rejectApplications,
)
clientRouter.get('/projects', requireAuth, requireClient, getMyProjects)
clientRouter.get(
  '/projects/:projectId',
  requireAuth,
  requireClient,
  getProjectWithID,
)
clientRouter.patch(
  '/project/:projectId/status',
  requireAuth,
  requireClient,
  completeProject,
)
clientRouter.get('/dashboard', requireAuth, requireClient, getClientDashboard)
clientRouter.get('/applications', requireAuth, requireClient, getMyApplications)
clientRouter.get('/profile', requireAuth, requireClient, getMyProfile)
clientRouter.get(
  '/freelancers/:userId',
  requireAuth,
  requireClient,
  getFreelancerProfile,
)
export default clientRouter
