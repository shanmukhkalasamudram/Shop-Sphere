const schemaOptionsPlugin = function (schema) {
  schema.set('timestamps', {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  schema.set('toJSON', {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });
};

module.exports = schemaOptionsPlugin;
