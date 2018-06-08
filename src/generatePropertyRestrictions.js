function generateSinglePropertyRestriction(schema) {
  return (key, text) => {
    if (schema[key]) {
      return `* ${text}: \`${schema[key]}\``;
    }
    return null;
  };
}

module.exports = function generatePropertyRestrictions(schema) {
  const generate = generateSinglePropertyRestriction(schema);
  return [
    generate('minimum', 'Minimum'),
    generate('maximum', 'Maximum'),
    generate('pattern', 'Regex pattern'),
    generate('minItems', 'Minimum items'),
    generate('uniqueItems', 'Unique items'),
  ].filter(text => text).join('\n');
};
