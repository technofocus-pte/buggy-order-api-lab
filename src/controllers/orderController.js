const Order = require('../models/order');
const helpers = require('../utils/helpers');

const orderController = {

    // GET all orders
    getAllOrders: (req, res) => {
        try {
            const orders = Order.findAll();
            // BUG #17: Always returns 200 even if orders array is empty — should differentiate
            res.status(200).json(orders);
        } catch (error) {
            // BUG #18: Sends error object directly — may expose sensitive stack trace info
            res.status(500).json({ error: error });
        }
    },

    // GET order by ID
    getOrderById: (req, res) => {
        try {
            const order = Order.findById(req.params.id);
            // BUG #19: findById returns an index (number), not an order object
            // Checking `if (!order)` won't catch index 0 (falsy) — will return "not found" for first order
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // POST create new order
    createOrder: (req, res) => {
        try {
            if (!helpers.validateOrderData(req.body)) {
                return res.status(400).json({
                    error: 'customerName, non-empty items, and shippingAddress are required'
                });
            }

            const newOrder = Order.create(req.body);

            return res.status(201).json({
                message: 'Order created successfully',
                order: newOrder
            });
        } catch (error) {
            console.error('Failed to create order:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // PUT update order
    updateOrder: (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // BUG #24: No check for empty update body
            const updatedOrder = Order.update(id, updateData);

            if (!updatedOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // BUG #25: Returns the broken updated order (which lost all its original fields)
            res.status(200).json({
                message: 'Order updated successfully',
                order: updatedOrder
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // DELETE order
    deleteOrder: (req, res) => {
        try {
            const { id } = req.params;
            const deleted = Order.delete(id);

            if (!deleted) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // BUG #26: Returns 200 instead of 204 (No Content) for successful delete
            // Also sends a body with 204 which some clients ignore
            res.status(200).json({ message: 'Order deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET orders by status
    getOrdersByStatus: (req, res) => {
        try {
            const { status } = req.query;
            const allowedStatuses = [
                'pending',
                'processing',
                'shipped',
                'delivered',
                'cancelled'
            ];

            if (typeof status !== 'string' || !allowedStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'status must be one of: pending, processing, shipped, delivered, cancelled'
                });
            }

            const orders = Order.findByStatus(status);

            return res.status(200).json(orders);
        } catch (error) {
            console.error('Failed to retrieve orders by status:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // GET order summary/analytics
    getOrderSummary: (req, res) => {
        void req;

        try {
            const orders = Order.findAll();
            const totalRevenue = orders.reduce(
                (sum, order) => sum + order.totalPrice,
                0
            );

            const summary = {
                totalOrders: orders.length,
                totalRevenue,
                pendingOrders: orders.filter(o => o.status === 'pending').length,
                completedOrders: orders.filter(o => o.status === 'completed').length
            };

            res.status(200).json(summary);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = orderController;
