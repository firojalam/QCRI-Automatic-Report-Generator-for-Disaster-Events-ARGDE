/**
 * Day_frequency.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  connection:'postgresServer',
  tableName: 'day_frequency',
  autoPK: false,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    date: {
      type:'datetime',
      allowNull: false,
    },
    frequency: {
      type: 'float',
      allowNull: false,
    },
  }
};
