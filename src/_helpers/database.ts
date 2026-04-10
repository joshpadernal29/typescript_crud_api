// file path: src/_helper/database.ts
import config from '../../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';

export interface Database {
    user: any; // we'll type this properly after model is created
    department: any;
    request: any;
}

// impliment database from interface database
export const db: Database = {} as Database;

export async function initialize(): Promise<void> {
    const { host, port, user, password, database } = config.database;

    // create the database if it doesnt exist yet
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    // Initialize models
    db.user = (await import('../users/user.model')).default(sequelize);
    db.department = (await import('../departments/department.model')).default(sequelize);
    db.request = (await import('../requests/request.model')).default(sequelize);

    // Define Associations (Relationships)
    // A User has many Requests
    db.user.hasMany(db.request, { foreignKey: 'userId', onDelete: 'CASCADE' });
    db.request.belongsTo(db.user, { foreignKey: 'userId' });

    // A Request belongs to a Department (Optional, depending on your logic)
    db.department.hasMany(db.request, { foreignKey: 'deptId' });
    db.request.belongsTo(db.department, { foreignKey: 'deptId' });

    await sequelize.sync({ alter: true });
    console.log('db initialized and models synced!');
}