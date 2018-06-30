const generatePropertySection = require('./src/generatePropertySection');
//const generateSchemaSectionText = require('./src/generateSchemaSectionText');

var subSchemaTypes;

function run(schema) {
  let text = [];
  let name = "";

  if (schema.properties) {
    if (schema.properties.name) {
      if (schema.properties.name.enum) {
        text.push(`# ${schema.properties.name.enum.join(" / ")}`);
        name = schema.properties.name.enum[0];
      }
      else {
        text.push(`# ${schema.$id}`);
        name = schema.properties.name;
      }
    }
  }
  else if (schema.title) {
    text.push(`# ${schema.title}`);
    name = schema.title;
  }
  else if (schema.$ref) {
    return {ref: schema.$ref};
  }
  else if (schema.title) {
    text.push(`# ${schema.title}`);
    name = schema.title;
  }
  else if (schema.$id) {
    text.push(`# ${schema.$id}`);
    name = schema.$id;
  }


  if (schema.description) {
    text.push(oneOf.description);
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

  return {text: text.filter(line => !!line).join('\n'), name: name};
}

module.exports = function ajvSchemaToMD(schema, perOneOfPropertyList = null) {
  subSchemaTypes = Object.keys(schema.definitions || {}).reduce((map, subSchemaTypeName) => {
    map[`#/definitions/${subSchemaTypeName}`] = subSchemaTypeName; // eslint-disable-line
    return map;
  }, {});

  if (typeof perOneOfPropertyList == "object") {
    let arrayOfProperties = [];
    perOneOfPropertyList.forEach(function(key) {
      let arrayOfText = [];
      if(!schema.properties[key]) {
        arrayOfText.push(run(schema));
      }
      else if(schema.properties[key].oneOf) {
        schema.properties[key].oneOf.forEach(function(oneOf) {
          arrayOfText.push(run(oneOf));
        });
      }
      
      arrayOfProperties.push(arrayOfText);
    });
    return arrayOfProperties;
  }
  return run(schema).text;
};
