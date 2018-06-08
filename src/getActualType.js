module.exports = function getActualType(schema) {
  if (Array.isArray(schema.type)) {
    return schema.type[0];
  }
  if (schema.type) {
    return schema.type;
  }
  return undefined;
};
