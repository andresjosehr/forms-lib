import { Tree, Rule, apply, url, applyTemplates, move, chain, mergeWith, SchematicContext } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import { EntityBuilderSchema } from './entity-builder';
import { Options } from './options';


export function entityCrudGenerator(options: Options): Rule {

  return (tree: Tree, context: SchematicContext) => {

    let entity;
    if(options.file) {
      const name = options.name.toLowerCase();
      entity = tree.readJson('src\\app\\entities-schemas\\'+ strings.dasherize(name) +'.json') as any;
    }

    if(options.entity) {
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
        ...entity
      }),
      move(normalize(`/${entity.frontend_path}/${pluralize(strings.dasherize(entity.name))}`))
    ]);


    return chain([
      mergeWith(templateSource),
    ])(tree, context);
  }
}


function checkForRelatedEntities(tree: Tree, entity: EntityBuilderSchema): EntityBuilderSchema {
  console.log(typeof entity)
  entity.fields = entity.fields.map((field) => {
    if(field.inputType === 'relatedSelect') {

      const entityName = field.relationshipProperties?.entity as string;

      // search recursively in the entities folder for the entity
      let relatedEntityPath = ''
      tree.getDir('src').visit((path) => {
        if(path.includes(pluralize(entityName)) && relatedEntityPath === '') {
          relatedEntityPath = path;
        }
      });
      console.log(1)
      relatedEntityPath = relatedEntityPath.replace(entityName+'.ts', '').replace('/src/', '');
      return {
        ...field,
        relatedEntityPath,
        relatedEntityName: strings.capitalize(entityName)
      }
    }
    return field
  }) as any;

  return entity;
}

function checkNewRoute(tree: Tree, entity: EntityBuilderSchema): void{
   // Add simple route inside app.routing.ts

   const routingModule = tree.read('src\\app\\app.routes.ts');

   const routingModuleContent = (routingModule as any).toString();

   // Remove the first path, example: if string is 'src/app', remove 'src/'
   console.log(2)
   const routeBasePath = entity.frontend_path.replace(/.*\//, '');
   if (!routingModuleContent.includes(`path: '${strings.dasherize(pluralize(entity.label))}',`)) {
    console.log(3)
     const newRoutingModuleContent = routingModuleContent.replace('/* Add new routes here */',
       `/* Add new routes here */
         { path: '${strings.dasherize(pluralize(entity.label))}', loadChildren: () => import('${routeBasePath}/${pluralize(strings.dasherize(entity.name))}/${pluralize(strings.dasherize(entity.name))}.module').then(m => m.${strings.classify(pluralize(entity.name))}Module) },
       `
     );
     tree.overwrite('src\\app\\app.routes.ts', newRoutingModuleContent);
   }
}

function checkMenu(tree: Tree, options: EntityBuilderSchema): void {
  // Get file in src\app\mock-api\common\navigation\data.ts
  const navigationFile = tree.read('src\\app\\mock-api\\common\\navigation\\data.ts');

  // Check if file includes "id   : 'example',"

  if (navigationFile && !navigationFile.toString().includes(`id   : '${strings.dasherize(pluralize(options.name))}',`)) {

    const navigationFileContent = navigationFile.toString();
    console.log(4)
    const newNavigationFileContent = navigationFileContent.replace('/* Add new menu items here */',
      `{
          id   : '${strings.dasherize(pluralize(options.name))}',
          title: '${strings.capitalize(pluralize(options.label))}',
          type : 'basic',
          // icon : 'email',
          link  : '/${strings.dasherize(pluralize(options.label))}'
       },

        /* Add new menu items here */
      `
    );
    tree.overwrite('src\\app\\mock-api\\common\\navigation\\data.ts', newNavigationFileContent);
  }

}


function pluralize(word: string): string {
  return word + 's';
}

// Make kebab case but sapce instead of underscore and first letter in uppercase
function labelize(word: string): string {
  word = strings.dasherize(word);
  console.log(5)
  return word.replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}


function pluralizeSpanish(word: string): string {
  // If the word ends with a vocal, add an 's' at the end
  if (word.endsWith('a') || word.endsWith('e') || word.endsWith('i') || word.endsWith('o') || word.endsWith('u')) {
    return word + 's';
  }

  // If the word ends with a consonant, add an 'es' at the end
  return word + 'es';
}
