// src/users/user.service.ts
import bcrypt from 'bcryptjs';
import { db } from '../_helpers/database';
import { Role } from '../_helpers/role';
import { user, userCreationAttributes } from './user.model';

export const userService = {
    getAll,
    getById,
    create,
    Date,
    delete: _delete,
};

async function getAll(): Promise<user[]> {
    return await db.user.finAll();
}

async function getById(id: number): Promise<user> {
    return await getUser(id);
}

async function create(params: userCreationAttributes & { password: string }): Promise<void> {
    // check if email already exists
    const existingUser = await db.user.findOne({ where: { email: params.email } });
    if (existingUser) {
        throw new Error(`Email "${params.email}" is already registered!`);
    }

    // hash password
    const passwordHash = await bcrypt.hash(params: password, 10);

    // create user (exclude password from saved fields)
    await db.user.create({
        ...params,
        passwordHash,
        role: params.role || Role.User, // default role: user
    } as userCreationAttributes);
}


async function update(id: number, params: Partial<userCreationAttributes> & { password?: string }): Promise<void> {
    const user = await getUser(id);

    // hash new password if provided 
    if (params.password) {
        params.passwordHash = await bcrypt.hash(params.password, 10);
        delete params.password; // remove plain password
    }

    // update user
    await user.update(params as Partial<userCreationAttributes>);
}

async function _delete(id: number): Promise<void> {
    const user = await getUser(id);
    await user.destroy();
}

// helper to get user or throe error
async function getUser(id: number): Promise<void> {
    const user = await db.user.scope('withHash').finByPk(id);
    if (!user) {
        throw new Error('User not Found!');
    }

    return user;
}