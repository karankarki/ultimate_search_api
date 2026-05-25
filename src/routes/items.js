const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const itemController = require('../controllers/itemController');

const router = express.Router();

router.get('/', requireAuth, itemController.getPaginatedItems);
router.get('/search', requireAuth, itemController.searchItems);
router.post('/', requireAuth, itemController.addItem);

module.exports = router;
