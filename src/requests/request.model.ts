import { DataTypes, Sequelize } from 'sequelize';

export default function (sequelize: Sequelize) {
    const attributes = {
        type: { type: DataTypes.STRING, allowNull: false },   // e.g., 'equipment', 'leave'
        items: { type: DataTypes.TEXT, allowNull: false },  // e.g., 'Laptop, Mouse'
        status: {
            type: DataTypes.ENUM('Pending', 'Approved', 'Disapproved'),
            defaultValue: 'Pending'
        }
    };

    return sequelize.define('request', attributes);
}