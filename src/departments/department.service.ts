import { db } from '../_helpers/database';

export const departmentService = {
    getAll: async () => await db.department.findAll(),

    getById: async (id: number) => await db.department.findByPk(id),

    create: async (params: { name: string }) => {
        // Validation: Check if department name already exists
        if (await db.department.findOne({ where: { name: params.name } })) {
            throw `Department "${params.name}" already exists`;
        }
        return await db.department.create(params);
    },

    update: async (id: number, params: any) => {
        const dept = await db.department.findByPk(id);
        if (!dept) throw 'Department not found'; // Prevents crash

        // Check if new name is taken by another record
        if (params.name && dept.name !== params.name &&
            await db.department.findOne({ where: { name: params.name } })) {
            throw `Department "${params.name}" is already taken`;
        }

        Object.assign(dept, params);
        await dept.save();
        return dept.get();
    },

    delete: async (id: number) => {
        const dept = await db.department.findByPk(id);
        if (!dept) throw 'Department not found'; // Prevents crash
        await dept.destroy();
    }
};