// In-memory data store (simulates a database)
const { randomUUID } = require('crypto');

let orders = [];

class Order {
    constructor(customerName, items, shippingAddress) {
        this.id = randomUUID();
        this.customerName = customerName;
        this.items = items;
        this.shippingAddress = shippingAddress;
        this.createdAt = Date.now();
        this.status = 'pending';
        this.totalPrice = this.calculateTotal();
    }

    calculateTotal() {
        return this.items.reduce(
            (total, item) => total + item.price * (item.quantity ?? 1),
            0
        );
    }

    static findAll() {
        return orders;
    }

    static findById(id) {
        // BUG #10: Using == instead of === (loose equality)
        // BUG #11: Returns index instead of the order object
        return orders.findIndex(order => order.id == id);
    }

    static validateOrderData(orderData) {
        const errors = [];

        if (!orderData || typeof orderData !== 'object') {
            return ['Order data is required'];
        }

        if (typeof orderData.customerName !== 'string' || !orderData.customerName.trim()) {
            errors.push('customerName is required');
        }

        if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
            errors.push('items must be a non-empty array');
        }

        if (
            orderData.shippingAddress == null ||
            (typeof orderData.shippingAddress === 'string' && !orderData.shippingAddress.trim())
        ) {
            errors.push('shippingAddress is required');
        }

        return errors;
    }

    static create(orderData) {
        const validationErrors = Order.validateOrderData(orderData);
        if (validationErrors.length > 0) {
            throw new Error(validationErrors.join(', '));
        }

        const newOrder = new Order(
            orderData.customerName,
            orderData.items,
            orderData.shippingAddress
        );
        orders.push(newOrder);
        return newOrder;
    }

    static update(id, updateData) {
        const orderIndex = orders.findIndex(order => order.id === id);
        if (orderIndex === -1) return null;

        // Merge updates to preserve fields not included in updateData.
        orders[orderIndex] = { ...orders[orderIndex], ...updateData };
        return orders[orderIndex];
    }

    static delete(id) {
        const orderIndex = orders.findIndex(order => order.id === id);
        if (orderIndex === -1) return false;
        // BUG #13: splice returns an array, but we want the single deleted object
        // Also, `splice(orderIndex)` without a second arg deletes everything from that index onward
        orders.splice(orderIndex);
        return true;
    }

    static findByStatus(status) {
        return orders.filter(order => order.status === status);
    }

}

module.exports = Order;
