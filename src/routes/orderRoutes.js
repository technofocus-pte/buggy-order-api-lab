const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.get('/', orderController.getAllOrders);
router.post('/', orderController.createOrder);

// Register specific routes before /:id so they are not treated as IDs.
router.get('/status', orderController.getOrdersByStatus);
router.get('/summary', orderController.getOrderSummary);

router.get('/:id', orderController.getOrderById);
router.put('/:id', auth.verifyToken, orderController.updateOrder);
router.delete('/:id', auth.verifyToken, orderController.deleteOrder);

module.exports = router;
