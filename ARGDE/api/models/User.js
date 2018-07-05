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
      columnName: 'super_admin',
    },
  },
  default_password: 'qatar123',
  // collectionPretty: {
  //   '170826213907_hurricane_harvey_2017': 'Hurricane Harvey 2017',
  // },
};
// module.exports = {
//   connection : 'postgresServer',
//   tableName: 'user',
//   autoCreatedAt: false,
//   autoUpdatedAt: false,
//   autoPK: false,
//   attributes: {
//     email: {
//       type: 'email',
//       required: true
//     },
//     password: {
//       type: 'string',
//       required: true
//     }
//   },
//
//
//   /**
//    * Create a new user using the provided inputs,
//    * but encrypt the password first.
//    *
//    * @param  {Object}   inputs
//    *                     • name     {String}
//    *                     • email    {String}
//    *                     • password {String}
//    * @param  {Function} cb
//    */
//
//   signup: function (inputs, cb) {
//     // Create a user
//     User.create({
//       name: inputs.name,
//       email: inputs.email,
//       // TODO: But encrypt the password first
//       password: inputs.password
//     })
//     .exec(cb);
//   },
//
//
//
//   /**
//    * Check validness of a login using the provided inputs.
//    * But encrypt the password first.
//    *
//    * @param  {Object}   inputs
//    *                     • email    {String}
//    *                     • password {String}
//    * @param  {Function} cb
//    */
//
//   attemptLogin: function (inputs, cb) {
//     // Create a user
//     User.findOne({
//       email: inputs.email,
//       // TODO: But encrypt the password first
//       password: inputs.password
//     })
//     .exec(cb);
//   }
// };
