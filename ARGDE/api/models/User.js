module.exports = {
  connection: 'postgresServer',
  schema: true,
  autoPK: false,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  tableName: 'user',
  attributes: {
    name: {
      type: 'string',
      required: true,
      allowNull: false,
      columnName: 'name',
    },
    username: {
      type: 'string',
      required: true,
      unique: true,
      allowNull: false,
      primaryKey: true,
      columnName: 'username',
    },
    email: {
      type: 'email',
      email: true,
      required: true,
      unique: true,
      allowNull: false,
      columnName: 'email',
    },
    encryptedPassword: {
      type: 'string',
      required: true,
      allowNull: false,
      columnName: 'password',
    },
    super_admin: {
      type: 'boolean',
      allowNull: false,
      columnName: 'super_admin',
    },
  },
  default_password: 'qatar123',
};
