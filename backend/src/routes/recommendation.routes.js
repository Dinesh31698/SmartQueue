const express = require('express');
const router = express.Router();
const recController = require('../controllers/recommendation.controller');

router.get('/trending', recController.getTrending);
router.get('/healthy', recController.getHealthyPicks);
router.get('/frequently-bought-together/:productId', recController.getFrequentlyBoughtTogether);
router.post('/ai-assistant', recController.queryAIAssistant);

module.exports = router;
