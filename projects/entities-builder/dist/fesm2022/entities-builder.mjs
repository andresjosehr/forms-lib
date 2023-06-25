import { apply, url, applyTemplates, move, chain, mergeWith } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';

function entityCrudGenerator(options) {
    return (tree, context) => {
        let entity;
        if (options.file) {
            const name = options.name.toLowerCase();
            entity = tree.readJson('src\\app\\entities-schemas\\' + strings.dasherize(name) + '.json');
        }
        if (options.entity) {
            entity = JSON.parse(options.entity);
        }
        // entity['entitySchema'] = entity.fields;
        // entity['label'] = entity.label;
        // entity['searchableList'] = entity.searchableList;
        entity = checkForRelatedEntities(tree, entity);
        checkNewRoute(tree, entity);
        checkMenu(tree, entity);
        const templateSource = apply(url('./files'), [
            applyTemplates({
                classify: strings.classify,
                dasherize: strings.dasherize,
                capitalize: strings.capitalize,
                camelize: strings.camelize,
                labelize: labelize,
                pluralizeSpanish: pluralizeSpanish,
                pluralize: pluralize,
                name: entity.name,
                label: entity.label,
                searchableList: entity.searchableList,
                entity
            }),
            move(normalize(`/${entity.frontend_path}/${pluralize(strings.dasherize(entity.name))}`))
        ]);
        return chain([
            mergeWith(templateSource),
        ])(tree, context);
    };
}
function checkForRelatedEntities(tree, entity) {
    entity.fields = entity.fields.map((field) => {
        if (field.inputType === 'relatedSelect') {
            const entityName = field.relationshipProperties?.entity;
            // search recursively in the entities folder for the entity
            let relatedEntityPath = '';
            tree.getDir('src').visit((path) => {
                if (path.includes(pluralize(entityName)) && relatedEntityPath === '') {
                    relatedEntityPath = path;
                }
            });
            relatedEntityPath = relatedEntityPath.replace(entityName + '.ts', '').replace('/src/', '');
            return {
                ...field,
                relatedEntityPath,
                relatedEntityName: strings.capitalize(entityName)
            };
        }
        return field;
    });
    return entity;
}
function checkNewRoute(tree, entity) {
    // Add simple route inside app.routing.ts
    const routingModule = tree.read('src\\app\\app.routes.ts');
    const routingModuleContent = routingModule.toString();
    // Remove the first path, example: if string is 'src/app', remove 'src/'
    const routeBasePath = entity.frontend_path.replace(/.*\//, '');
    if (!routingModuleContent.includes(`path: '${strings.dasherize(pluralize(entity.label))}',`)) {
        const newRoutingModuleContent = routingModuleContent.replace('/* Add new routes here */', `/* Add new routes here */
         { path: '${strings.dasherize(pluralize(entity.label))}', loadChildren: () => import('${routeBasePath}/${pluralize(strings.dasherize(entity.name))}/${pluralize(strings.dasherize(entity.name))}.module').then(m => m.${strings.classify(pluralize(entity.name))}Module) },
       `);
        tree.overwrite('src\\app\\app.routes.ts', newRoutingModuleContent);
    }
}
function checkMenu(tree, options) {
    // Get file in src\app\mock-api\common\navigation\data.ts
    const navigationFile = tree.read('src\\app\\mock-api\\common\\navigation\\data.ts');
    // Check if file includes "id   : 'example',"
    if (navigationFile && !navigationFile.toString().includes(`id   : '${strings.dasherize(pluralize(options.name))}',`)) {
        const navigationFileContent = navigationFile.toString();
        const newNavigationFileContent = navigationFileContent.replace('/* Add new menu items here */', `{
          id   : '${strings.dasherize(pluralize(options.name))}',
          title: '${strings.capitalize(pluralize(options.label))}',
          type : 'basic',
          // icon : 'email',
          link  : '/${strings.dasherize(pluralize(options.label))}'
       },

        /* Add new menu items here */
      `);
        tree.overwrite('src\\app\\mock-api\\common\\navigation\\data.ts', newNavigationFileContent);
    }
}
function pluralize(word) {
    return word + 's';
}
// Make kebab case but sapce instead of underscore and first letter in uppercase
function labelize(word) {
    word = strings.dasherize(word);
    return word.replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, '-')
        .toLowerCase();
}
function pluralizeSpanish(word) {
    // If the word ends with a vocal, add an 's' at the end
    if (word.endsWith('a') || word.endsWith('e') || word.endsWith('i') || word.endsWith('o') || word.endsWith('u')) {
        return word + 's';
    }
    // If the word ends with a consonant, add an 'es' at the end
    return word + 'es';
}

/*
 * Public API Surface of entities-builder
 */

/**
 * Generated bundle index. Do not edit.
 */

export { entityCrudGenerator };
//# sourceMappingURL=entities-builder.mjs.map
