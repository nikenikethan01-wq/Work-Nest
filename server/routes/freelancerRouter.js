import express from 'express'
import { requireAuth, requireFreelancer } from '../middleware/middleware.js'
import {
  getAllJobs,
  createApplication,
  getMyApplications,
  getMyProjects,
  getProjectWithID,
  submitProject,
  getFreelancerDashboard,
  getMyProfile,
  getJobWithID,
  getApplicationDetails,
  getClientProfile,
} from '../controller/freelancerController.js'

const freelancerRouter = express.Router()

freelancerRouter.get('/jobs', requireAuth, requireFreelancer, getAllJobs)
freelancerRouter.post(
  '/jobs/:id/application',
  requireAuth,
  requireFreelancer,
  createApplication,
)
freelancerRouter.get(
  '/applications/my',
  requireAuth,
  requireFreelancer,
  getMyApplications,
)

freelancerRouter.get('/jobs/:id', requireAuth, requireFreelancer, getJobWithID)

freelancerRouter.get('/projects', requireAuth, requireFreelancer, getMyProjects)
freelancerRouter.get(
  '/projects/:projectId',
  requireAuth,
  requireFreelancer,
  getProjectWithID,
)
freelancerRouter.patch(
  '/project/:projectId/submit',
  requireAuth,
  requireFreelancer,
  submitProject,
)
freelancerRouter.get(
  '/dashboard',
  requireAuth,
  requireFreelancer,
  getFreelancerDashboard,
)

freelancerRouter.get(
  '/applications/:jobId',
  requireAuth,
  requireFreelancer,
  getApplicationDetails,
)
freelancerRouter.get('/profile', requireAuth, requireFreelancer, getMyProfile)

freelancerRouter.get(
  '/clients/:userId',
  requireAuth,
  requireFreelancer,
  getClientProfile,
)

export default freelancerRouter
