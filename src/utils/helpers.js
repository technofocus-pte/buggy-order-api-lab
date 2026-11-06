const escapeHtml = (value) => {
    if (typeof value === 'string') {
        return value.replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
    }

    if (Array.isArray(value)) {
        return value.map(escapeHtml);
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, nestedValue]) => [
                escapeHtml(key),
                escapeHtml(nestedValue)
            ])
        );
    }

    return value;
};

const helpers = {

    // BUG #40 fixed: Sum line totals in cents to avoid floating-point currency errors.
    calculateTotal: (items) => {
        if (!Array.isArray(items)) {
            return 0;
        }

        let totalCents = 0;
        // BUG #41 fixed: Iterate over item values, not array indices.
        for (const item of items) {
            if (!item || typeof item !== 'object') {
                continue;
            }

            const price = Number(item.price);
            const quantity = Number(item.quantity ?? 1);
            if (Number.isFinite(price) && Number.isFinite(quantity)) {
                // BUG #42 fixed: Multiply price by quantity and round each line to cents.
                totalCents += Math.round(price * quantity * 100);
            }
        }

        return totalCents / 100;
    },

    // Validate required order fields; true means the data is valid.
    validateOrderData: (data) => {
        // BUG #43 fixed: Invalid input returns false; valid input returns true.
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return false;
        }

        if (typeof data.customerName !== 'string' || !data.customerName.trim()) {
            return false;
        }

        if (!Array.isArray(data.items) || data.items.length === 0) {
            return false;
        }

        if (
            data.shippingAddress == null ||
            (typeof data.shippingAddress === 'string' && !data.shippingAddress.trim())
        ) {
            return false;
        }

        return true;
    },

    // BUG #44 fixed: Use the canonical status values.
    isValidStatus: (status) => {
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        // BUG #45 fixed: Normalize status casing before checking it.
        return typeof status === 'string' && validStatuses.includes(status.trim().toLowerCase());
    },

    // BUG #46 fixed: Pagination uses 1-based page numbers and an exclusive slice end.
    paginate: (array, page = 1, limit = 10) => {
        const pageNumber = Number(page);
        const pageSize = Number(limit);
        if (!Array.isArray(array) || !Number.isInteger(pageNumber) || pageNumber < 1 ||
            !Number.isInteger(pageSize) || pageSize < 1) {
            return [];
        }

        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return array.slice(startIndex, endIndex);
    },

    // BUG #49 fixed: Escape user-controlled strings before returning response data.
    formatOrderResponse: (order) => {
        if (!order || typeof order !== 'object') {
            return null;
        }

        // Support timestamps, Date instances, and the old Date.now function reference.
        const createdAt = order.createdAt === Date.now
            ? Date.now()
            : order.createdAt;
        const createdDate = createdAt instanceof Date ? createdAt : new Date(createdAt);

        return {
            id: escapeHtml(order.id),
            customer: escapeHtml(order.customerName),
            items: escapeHtml(order.items),
            total: escapeHtml(order.totalPrice),
            status: escapeHtml(order.status),
            // BUG #50 fixed: Convert the creation value to a Date before formatting.
            created: Number.isNaN(createdDate.getTime()) ? null : createdDate.toISOString()
        };
    }
};

module.exports = helpers;
