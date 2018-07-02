const generateElementTitle = require('./generateElementTitle');
const generatePropertyRestrictions = require('./generatePropertyRestrictions');
const getActualType = require('./getActualType');

function getPrefixByDepth(depth) {
    let res = '';
    for(let i = 0; i < depth; i++) {
        res += ' ';
    }
    return res;
}
function generatePropertySection(depth, schema, subSchemas) {
    if (schema.oneOf && schema.properties) {
        var oneOfList = []
        schema.oneOf.forEach(function(oneOf) {
            oneOfList.push(Object.keys(oneOf.properties).map((propertyKey) => {
                const propertyIsRequired = oneOf.required && oneOf.required.indexOf(propertyKey) >= 0;
                const prefix = getPrefixByDepth(depth);
                return generateSchemaSectionText(depth + 1, `${prefix}- `, propertyKey, propertyIsRequired, oneOf.properties[propertyKey], subSchemas).join('\n') + "\n";
            }).join('\n'))
        });
        res = [
            Object.keys(schema.properties).map((propertyKey) => {
                const propertyIsRequired = schema.required && schema.required.indexOf(propertyKey) >= 0;
                const prefix = getPrefixByDepth(depth);
                return generateSchemaSectionText(depth + 1, `${prefix}- `, propertyKey, propertyIsRequired, schema.properties[propertyKey], subSchemas);
            }),
            [getPrefixByDepth(depth) + '### This property must be one of the following types:', oneOfList]
        ];
        return res;
    } else if (schema.properties) {
        return Object.keys(schema.properties).map((propertyKey) => {
            const propertyIsRequired = schema.required && schema.required.indexOf(propertyKey) >= 0;
            const prefix = getPrefixByDepth(depth);
            return generateSchemaSectionText(depth + 1, `${prefix}- `, propertyKey, propertyIsRequired, schema.properties[propertyKey], subSchemas);
        });
    } else if (schema.oneOf) {
        const oneOfList = schema.oneOf.map(innerSchema => `* \`${getActualType(innerSchema, subSchemas)}\``).join('\n');
        return [getPrefixByDepth(depth) + '### This property must be one of the following types:', oneOfList];
    }
    return [];
}

function generateSchemaSectionText(
    depth, prefix, name,
    isRequired, schema, subSchemas,
) {
    const schemaType = getActualType(schema, subSchemas);
    const firstline = (`${generateElementTitle(prefix, name, schemaType, isRequired, schema.enum, schema.example)}`).concat(schema.description ?  ` - ${schema.description}` : '');
    let text = [
        firstline
    ];

    if (schemaType === 'object') {
        if (schema.properties) {
            generatePropertySection(depth + 1, schema, subSchemas)
                .forEach((section) => {
                    text = text.concat(section);
                });
        }
    } else if (schemaType === 'array') {
        let itemsType = schema.items && schema.items.type;

        if (!itemsType && schema.items && schema.items.$ref) {
            itemsType = getActualType(schema.items, subSchemas);
        }

        if (itemsType && name) {
            text.push(getPrefixByDepth(depth + 1) + `#### The object is an array with all elements of the type \`${itemsType}\`.`);
        } else if (itemsType) {
            text.push(getPrefixByDepth(depth + 1) + `#### The schema defines an array with all elements of the type \`${itemsType}\`.`);
        } else {
            let validationItems = [];
            const items = schema.items || {};
            if (items.allOf) {
                text.push(getPrefixByDepth(depth + 1) + '#### The elements of the array must match *all* of the following properties:');
                validationItems = schema.items.allOf;
            } else if (items.anyOf) {
                text.push(getPrefixByDepth(depth + 1) + '#### The elements of the array must match *at least one* of the following properties:');
                validationItems = schema.items.anyOf;
            } else if (items.oneOf) {
                text.push(getPrefixByDepth(depth + 1) + '#### The elements of the array must match *exactly one* of the following properties:');
                validationItems = schema.items.oneOf;
            } else if (items.not) {
                text.push(getPrefixByDepth(depth + 1) + '#### The elements of the array must *not* match the following properties:');
                validationItems = schema.items.not;
            }

            if (validationItems.length > 0) {
                validationItems.forEach((item) => {
                    text = text.concat(generateSchemaSectionText(
                        depth + 1,
                        prefix,
                        undefined, false, item, subSchemas,
                    ));
                });
            }
        }

        if (itemsType === 'object') {
            text.push(getPrefixByDepth(depth + 1) + '#### The array object has the following properties:');
            generatePropertySection(depth + 1, schema.items, subSchemas).forEach((section) => {
                text = text.concat(section);
            });
        }
    } else if (schema.oneOf) {
        text.push(getPrefixByDepth(depth + 1) + '#### The object must be one of the following types:');
        text.push(schema.oneOf.map(oneOf => `* \`${subSchemas[oneOf.$ref]}\``).join('\n'));
    }

    if (schema.enum) {
        text.push(getPrefixByDepth(depth + 1) + '#### This element must be one of the following enum values:');
        text.push(schema.enum.map(enumItem => `${getPrefixByDepth(depth + 1)}- \`${enumItem}\``).join('\n'));
    }

    if (schema.default !== undefined) {
        if (schema.default === null || ['boolean', 'number', 'string'].indexOf(typeof schema.default) !== -1) {
            text.push(getPrefixByDepth(depth + 1) + `#### Default: \`${JSON.stringify(schema.default)}\``);
        } else {
            text.push(getPrefixByDepth(depth + 1) + '#### Default:');
            text.push(`\`\`\`\n${JSON.stringify(schema.default, null, 2)}\n\`\`\``);
        }
    }

    const restrictions = generatePropertyRestrictions(schema);

    if (restrictions) {
        text.push(getPrefixByDepth(depth + 1) + '#### Additional restrictions:');
        text.push(getPrefixByDepth(depth + 1) + restrictions);
    }

    return text;
};

module.exports = generatePropertySection;
