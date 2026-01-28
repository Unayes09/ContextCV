// routes/portfolioRoutes.js
const express = require('express');
const router = express.Router();
const { updateReadme, getPortfolio, getPublicPortfolio } = require('../controllers/portfolioControllers');
const auth = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Portfolio
 *   description: Portfolio management
 */

/**
 * @swagger
 * /api/portfolio/{userId}:
 *   get:
 *     summary: Get public portfolio content
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Public portfolio content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 content:
 *                   type: string
 *                   description: Markdown content
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Portfolio not found
 *       500:
 *         description: Server error
 */
router.get('/:userId', getPublicPortfolio);

/**
 * @swagger
 * /api/portfolio:
 *   get:
 *     summary: Get portfolio content
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portfolio content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 content:
 *                   type: string
 *                   description: Markdown content
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Portfolio not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update portfolio content (README)
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Markdown content for the portfolio
 *     responses:
 *       200:
 *         description: Portfolio updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', auth, getPortfolio);
router.put('/', auth, updateReadme);
module.exports = router;