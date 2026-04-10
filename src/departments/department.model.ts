import { DataTypes, Sequelize } from 'sequelize';

export default function (sequelize: Sequelize) {
    const attributes = {
        name: { type: DataTypes.STRING, allowNull: false, unique: true }
    };

    return sequelize.define('department', attributes);
}