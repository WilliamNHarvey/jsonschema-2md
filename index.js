const generatePropertySection = require('./src/generatePropertySection');
//const generateSchemaSectionText = require('./src/generateSchemaSectionText');

module.exports = function ajvSchemaToMD(schema, perOneOfPropertyList = null) {
  const subSchemaTypes = Object.keys(schema.definitions || {}).reduce((map, subSchemaTypeName) => {
    map[`#/definitions/${subSchemaTypeName}`] = subSchemaTypeName; // eslint-disable-line
    return map;
  }, {});

  if (typeof perOneOfPropertyList == "object") {
    let arrayOfProperties = [];
    perOneOfPropertyList.forEach(function(key) {
      let arrayOfText = [];
      if(schema.properties[key].oneOf) {
        schema.properties[key].oneOf.forEach(function(oneOf) {
          let text = [];
          let name = "";

          if (oneOf.properties.name) {
            if (oneOf.properties.name.enum) {
              text.push(`# ${oneOf.properties.name.enum.join(" / ")}`);
              name = oneOf.properties.name.enum[0];
            }
            else {
              text.push(`# ${oneOf.properties.name}`);
              name = oneOf.properties.name;
            }
          }
          else if (oneOf.title) {
            text.push(`# ${oneOf.title}`);
            name = oneOf.title;
          }
          else if (schema.title) {
            text.push(`# ${schema.title}`);
            name = schema.title;
          }
          else if (schema.$id) {
            text.push(`# ${schema.$id}`);
            name = schema.$id;
          }


          if (oneOf.description) {
            text.push(oneOf.description);
          }
          text.push('## The schema defines the following properties:');
          generatePropertySection(0, oneOf, subSchemaTypes).forEach((section) => {
            text = text.concat(section);
          });


          if (schema.definitions) {
            text.push('---');
            text.push('# Sub Schemas');
            text.push('The schema defines the following additional types:');
            Object.keys(schema.definitions).forEach((subSchemaTypeName) => {
              text.push(`## \`${subSchemaTypeName}\` (${schema.definitions[subSchemaTypeName].type})`);
              text.push(schema.definitions[subSchemaTypeName].description);
              if (schema.definitions[subSchemaTypeName].type === 'object') {
                if (schema.definitions[subSchemaTypeName].properties) {
                  text.push(`Properties of the \`${subSchemaTypeName}\` object:`);
                }
              }
              generatePropertySection(1, schema.definitions[subSchemaTypeName], subSchemaTypes).forEach((section) => {
                text = text.concat(section);
              });
            });
          }

          arrayOfText.push({text: text.filter(line => !!line).join('\n'), name: name});
        });
      }
      
      arrayOfProperties.push(arrayOfText);
    });
    return arrayOfProperties;
  }

  let text = [];

  if (schema.title) {
    text.push(`# ${schema.title}`);
  }
  else if (schema.$id) {
    text.push(`# ${schema.$id}`);
  }


  if (schema.description) {
    text.push(schema.description);
  }
  text.push('## The schema defines the following properties:');
  generatePropertySection(0, schema, subSchemaTypes).forEach((section) => {
    text = text.concat(section);
  });


  if (schema.definitions) {
    text.push('---');
    text.push('# Sub Schemas');
    text.push('The schema defines the following additional types:');
    Object.keys(schema.definitions).forEach((subSchemaTypeName) => {
      text.push(`## \`${subSchemaTypeName}\` (${schema.definitions[subSchemaTypeName].type})`);
      text.push(schema.definitions[subSchemaTypeName].description);
      if (schema.definitions[subSchemaTypeName].type === 'object') {
        if (schema.definitions[subSchemaTypeName].properties) {
          text.push(`Properties of the \`${subSchemaTypeName}\` object:`);
        }
      }
      generatePropertySection(1, schema.definitions[subSchemaTypeName], subSchemaTypes).forEach((section) => {
        text = text.concat(section);
      });
    });
  }

  return text.filter(line => !!line).join('\n');
};
