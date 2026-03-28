// file path: src/_helper/database.ts
import config from '../../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';

export interface Database {
    user: any; // we'll type this properly after model is created
}

// impliment database from interface database
export const db: Database = {} as Database;

export async function initialize(): Promise<void> {
    const { host, port, user, password, database } = config.database;

    // create the database if it doesnt exist yet
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    // connect to db with sequelize
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    // initialize models
    const { default: userModel } = await import('../users/user.model');
    db.user = userModel(sequelize);

    // sync models with db
    await sequelize.sync({ alter: true });

    // check console
    console.log('db initialized and models synced!');
}