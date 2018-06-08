module.exports = function generateElementTitle(
  octothorpes, elementName,
  elementType, isRequired, isEnum, example,
) {
  const text = [octothorpes];
  if (elementName) {
    text.push(`\`${elementName}\``);
  }
  if (elementType || isRequired) {
    text.push(' (');
    if (elementType) {
      text.push(elementType);
    }
    if (isEnum) {
      text.push(', enum');
    }
    if (isRequired) {
      text.push(', required');
    }
    text.push(')');
  }
  if (example) {
    text.push(` eg: \`${example}\``);
  }
  return text.join('');
};
