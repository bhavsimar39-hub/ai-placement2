// =============================================
// Learning Roadmap Routes
// All API endpoints for roadmap functionality
// =============================================

import express from 'express';
import roadmapController from '../controllers/roadmapController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes (no auth required)

// GET /api/roadmap/roles - Get all available roles
router.get('/roles', roadmapController.getAllRoles);

// Protected Routes (auth required)

// GET /api/roadmap/questions/:role - Get questionnaire for specific role
router.get('/questions/:role', authMiddleware, roadmapController.getQuestions);

// POST /api/roadmap/generate - Generate personalized roadmap
// Body: { role: string, answers: array }
router.post('/generate', authMiddleware, roadmapController.generateRoadmap);

// GET /api/roadmap/progress/:role - Get user's progress for a role
router.get('/progress/:role', authMiddleware, roadmapController.getProgress);

// POST /api/roadmap/progress/update - Update skill completion status
// Body: { role: string, phaseNumber: number, skillName: string, completed: boolean }
router.post('/progress/update', authMiddleware, roadmapController.updateSkillProgress);

// POST /api/roadmap/phase-coach - Get Groq AI coaching tip for a specific phase
// Body: { role: string, phaseName: string, skills: array, knownLanguages: array, learningStyle: string }
router.post('/phase-coach', authMiddleware, roadmapController.getPhaseCoach);

export default router;