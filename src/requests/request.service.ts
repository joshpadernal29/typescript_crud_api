// src / requests / request.service.ts
import { db } from '../_helpers/database';

export const requestService = {
    // Get all requests (Admin/View)
    getAll: async () => {
        return await db.request.findAll({
            include: [{
                model: db.user,
                as: 'user',
                attributes: ['firstname', 'lastname', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });
    },

    // Create a new request (User View)
    create: async (params: { type: string, items: string, userId: number }) => {
        return await db.request.create(params);
    },

    // Update Status (Admin Approval/Disapproval)
    updateStatus: async (id: number, status: 'Approved' | 'Disapproved') => {
        const request = await db.request.findByPk(id);
        if (!request) throw 'Request not found';

        request.status = status;
        await request.save();
        return request;
    }
};