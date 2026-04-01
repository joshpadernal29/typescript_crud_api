// src/users/user.service.ts
import bcrypt from 'bcryptjs';
import { db } from '../_helpers/database';
import { Role } from '../_helpers/role';
import { User, UserCreationAttributes } from './user.model';

export const userService = {
    authenticate, // for login
    getAll,
    getById,
    create,
    update,
    delete: _delete,
};

// for user login
async function authenticate({ email, password }: any) {
    // 1. Find user and include the password hash (using the 'withHash' scope)
    const user = await db.user.scope('withHash').findOne({ where: { email } });

    // 2. Compare passwords using bcrypt
    // user.passwordHash comes from your DB, password comes from the login form
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new Error('Invalid Email or Password');
    }

    // 3. Remove passwordHash from the object before sending it to the frontend
    const { passwordHash, ...userWithoutHash } = user.get();
    return userWithoutHash;
}

// get all
async function getAll(): Promise<User[]> {
    return await db.user.findAll();
}

// get user by id
async function getById(id: number): Promise<User> {
    return await getUser(id);
}

// create user
async function create(params: UserCreationAttributes & { password: string }): Promise<void> {
    // check if email already exists
    const existingUser = await db.user.findOne({ where: { email: params.email } });
    if (existingUser) {
        throw new Error(`Email "${params.email}" is already registered!`);
    }

    // hash password
    const passwordHash = await bcrypt.hash(params.password, 10);

    // create user (exclude password from saved fields)
    await db.user.create({
        ...params,
        passwordHash,
        role: params.role || Role.User, // default role: user
    } as UserCreationAttributes);
}

// update user
async function update(id: number, params: Partial<UserCreationAttributes> & { password?: string }): Promise<void> {
    const user = await getUser(id);

    // hash new password if provided 
    if (params.password) {
        params.passwordHash = await bcrypt.hash(params.password, 10);
        delete params.password; // remove plain password
    }

    // update user
    await user.update(params as Partial<UserCreationAttributes>);
}

// delete user
async function _delete(id: number): Promise<void> {
    const user = await getUser(id);
    await user.destroy();
}

// helper to get user or throe error
async function getUser(id: number): Promise<User> {
    const user = await db.user.scope('withHash').findByPk(id);
    if (!user) {
        throw new Error('User not Found!');
    }

    return user;
}