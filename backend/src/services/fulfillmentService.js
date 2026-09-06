const model = require("../models/fulfillmentModel");

async function getDashboard(filters) {
    const [
        summary,
        fulfillments,
        warehouses,
        capacity,
        attention,
        activity
    ] = await Promise.all([
        model.getSummary(),
        model.getFulfillments(filters),
        model.getWarehouses(),
        model.getWarehouseCapacity(),
        model.getRequiresAttention(),
        model.getRecentActivity()
    ]);

    return {
        summary: {
            totalActive: Number(summary.total_active || 0),
            processing: Number(summary.processing || 0),
            readyToShip: Number(summary.ready_to_ship || 0),
            inTransit: Number(summary.in_transit || 0),
            delivered: Number(summary.delivered || 0),
            delayed: Number(summary.delayed || 0)
        },
        fulfillments: {
            rows: fulfillments.rows,
            pagination: {
                page: Number(filters.page || 1),
                limit: Number(filters.limit || 10),
                total: fulfillments.total,
                totalPages: Math.ceil(fulfillments.total / Number(filters.limit || 10))
            }
        },
        warehouses,
        warehouseCapacity: capacity,
        requiresAttention: attention,
        recentActivity: activity
    };
}

async function createFulfillmentTransaction(data, userId) {
    const { quotation_id, customer_id, expected_delivery_date, notes } = data;
    const client = await model.pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Fetch quotation items
        const quoteItems = await model.getQuotationItems(client, quotation_id);
        if (!quoteItems || quoteItems.length === 0) {
            throw new Error("No items found for this quotation.");
        }

        // 2. Fetch all available inventory
        const inventory = await model.checkInventory(client);

        // Generate Fulfillment Number (Mock format: FUL-TIMESTAMP)
        const fulfillment_number = `FUL-${Date.now().toString().slice(-4)}`;

        let totalBackorder = 0;
        let isFullyAllocated = true;

        // 3. Create Fulfillment Record
        const insertFulfillmentRes = await client.query(`
            INSERT INTO fulfillments (fulfillment_number, quotation_id, customer_id, expected_delivery_date, notes, created_by, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [
            fulfillment_number, 
            quotation_id, 
            customer_id, 
            expected_delivery_date || null, 
            notes || null, 
            userId || null,
            'PROCESSING' // Will update later if backordered
        ]);
        const fulfillmentId = insertFulfillmentRes.rows[0].id;

        // 4. Process each item and allocate across warehouses
        for (const item of quoteItems) {
            let remainingToAllocate = Number(item.quantity);
            let allocatedForThisItem = 0;

            // Find inventory for this product
            const availableWarehouses = inventory.filter(inv => inv.product_id === item.product_id);

            // Create Fulfillment Item first (without final allocated/backorder counts yet)
            const insertItemRes = await client.query(`
                INSERT INTO fulfillment_items (fulfillment_id, quotation_item_id, product_id, ordered_quantity)
                VALUES ($1, $2, $3, $4)
                RETURNING id
            `, [fulfillmentId, item.id, item.product_id, item.quantity]);
            const fulfillmentItemId = insertItemRes.rows[0].id;

            // Try allocating from available warehouses
            for (const wh of availableWarehouses) {
                if (remainingToAllocate <= 0) break;
                if (wh.available_quantity <= 0) continue;

                const qtyToTake = Math.min(remainingToAllocate, wh.available_quantity);
                
                // Deduct from inventory
                await client.query(`
                    UPDATE warehouse_inventory 
                    SET available_quantity = available_quantity - $1,
                        reserved_quantity = reserved_quantity + $1
                    WHERE warehouse_id = $2 AND product_id = $3
                `, [qtyToTake, wh.warehouse_id, item.product_id]);

                // Record allocation
                await client.query(`
                    INSERT INTO fulfillment_allocations (fulfillment_item_id, warehouse_id, allocated_quantity)
                    VALUES ($1, $2, $3)
                `, [fulfillmentItemId, wh.warehouse_id, qtyToTake]);

                // Log Activity for warehouse allocation
                await client.query(`
                    INSERT INTO fulfillment_activity (fulfillment_id, action, description, performed_by)
                    VALUES ($1, $2, $3, $4)
                `, [
                    fulfillmentId, 
                    'ALLOCATION', 
                    `Allocated ${qtyToTake} units of product ${item.product_id} from ${wh.warehouse_name}.`, 
                    userId || null
                ]);

                // Update locals
                wh.available_quantity -= qtyToTake; // Update local memory representation
                remainingToAllocate -= qtyToTake;
                allocatedForThisItem += qtyToTake;
            }

            // If there's still remainder, it's a backorder
            const backordered = remainingToAllocate > 0 ? remainingToAllocate : 0;
            if (backordered > 0) {
                totalBackorder += backordered;
                isFullyAllocated = false;
            }

            // Update fulfillment item with final counts
            await client.query(`
                UPDATE fulfillment_items
                SET allocated_quantity = $1, backordered_quantity = $2
                WHERE id = $3
            `, [allocatedForThisItem, backordered, fulfillmentItemId]);
        }

        // 5. Set Final Fulfillment Status based on allocations
        const finalStatus = isFullyAllocated ? 'PROCESSING' : 'BACKORDERED';
        await client.query(`
            UPDATE fulfillments
            SET status = $1
            WHERE id = $2
        `, [finalStatus, fulfillmentId]);

        // 6. Log Initial Creation Activity
        await client.query(`
            INSERT INTO fulfillment_activity (fulfillment_id, action, description, performed_by)
            VALUES ($1, $2, $3, $4)
        `, [
            fulfillmentId, 
            'CREATED', 
            `Fulfillment ${fulfillment_number} created with status ${finalStatus}.`, 
            userId || null
        ]);

        await client.query("COMMIT");
        return { success: true, fulfillmentId, fulfillment_number, finalStatus };

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Transaction Error:", error);
        throw error;
    } finally {
        client.release();
    }
}

async function getFulfillmentById(id) {
    return await model.getFulfillmentById(id);
}

async function updateFulfillmentStatus(id, status, notes, userId) {
    return await model.updateFulfillmentStatus(id, status, notes, userId);
}

async function shipFulfillment(id, carrier, trackingNumber, userId) {
    return await model.shipFulfillment(id, carrier, trackingNumber, userId);
}

async function getSplitSuggestion(id) {
    const fulfillment = await model.getFulfillmentById(id);
    
    // Mock split logic based on live stock (simulated)
    const suggestedSplits = [
        {
            warehouse_name: 'Bengaluru Central Hub',
            warehouse_code: 'WH-BLR-01',
            quantity_fulfilled: 24,
            estimated_shipments: 1,
            estimated_cost: 450,
            items: [
                { name: 'Ergonomic Executive Chair', qty: 12 },
                { name: 'Premium Monitor Arm', qty: 12 }
            ]
        },
        {
            warehouse_name: 'Mumbai Logistics Hub',
            warehouse_code: 'WH-BOM-02',
            quantity_fulfilled: 6,
            estimated_shipments: 1,
            estimated_cost: 250,
            items: [
                { name: 'Workspace Storage Unit', qty: 6 }
            ]
        }
    ];

    // Determine if backorder is possible
    const canConsolidateBackorder = true; 

    return {
        splits: suggestedSplits,
        total_shipments: 2,
        total_estimated_cost: 700,
        canConsolidateBackorder
    };
}

async function acceptSplit(id, userId) {
    // In a real system, this would write to the database to officially lock the split
    return await model.updateFulfillmentStatus(id, 'PROCESSING', 'Split accepted and locked', userId);
}

async function consolidateBackorder(id, userId) {
    // Real system: check inventory and allocate newly arrived stock
    return await model.updateFulfillmentStatus(id, 'PROCESSING', 'Backorder consolidated. All items allocated.', userId);
}

module.exports = {
    getDashboard,
    createFulfillmentTransaction,
    getFulfillmentById,
    updateFulfillmentStatus,
    shipFulfillment,
    getSplitSuggestion,
    acceptSplit,
    consolidateBackorder
};
