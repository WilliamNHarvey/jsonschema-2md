module.exports = function getActualType(schema) {
  if (Array.isArray(schema.type)) {
    return schema.type[0];
  }
  if (schema.type) {
    return schema.type;
  }
  if (schema.enum) {
    return typeof schema.enum[0];
  }
  return undefined;
};
