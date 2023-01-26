import { Tree, Rule, apply, url, applyTemplates, move, chain, mergeWith, SchematicContext } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import { EntityBuilderSchema } from './entity-builder';


export function entityCrudGenerator(options: EntityBuilderSchema): Rule {

  return (tree: Tree, context: SchematicContext) => {

    // Get the file and read it
    const peopleJson = tree.readJson('src\\app\\entities-schemas\\'+ strings.dasherize(options.name) +'.json');
    options['entitySchema'] = peopleJson as any;
    options = checkForRelatedEntities(tree, options);
    checkNewRoute(tree, options);

    // options = checkForRelatedEntities(tree, options);

    const templateSource = apply(url('./files'), [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        capitalize: strings.capitalize,
        camelize: strings.camelize,
        labelize: labelize,
        pluralizeSpanish: pluralizeSpanish,
        pluralize: pluralize,
        ...options
      }),
      move(normalize(`/${options.path}/${pluralize(strings.dasherize(options.name))}`))
    ]);


    return chain([
      mergeWith(templateSource),
    ])(tree, context);
  }
}


function checkForRelatedEntities(tree: Tree, options: EntityBuilderSchema): EntityBuilderSchema {
  options.entitySchema = options.entitySchema.map((field) => {
    if(field.inputType === 'relatedEntity') {

      const entityName = field.sqlProperties.relatedEntity?.split(':')[0] as string;

      // search recursively in the entities folder for the entity
      let relatedEntityPath = ''
      tree.getDir('src').visit((path) => {
        if(path.includes(pluralize(entityName)) && relatedEntityPath === '') {
          relatedEntityPath = path;
        }
      });
      relatedEntityPath = relatedEntityPath.replace(entityName+'.ts', '').replace('/src/', '');
      return {
        ...field,
        relatedEntityPath,
        relatedEntityName: strings.capitalize(entityName)
      }
    }
    return field
  }) as any;

  return options;
}

function checkNewRoute(tree: Tree, options: EntityBuilderSchema): void{
   // Add simple route inside app.routing.ts

   const routingModule = tree.read('src\\app\\app.routing.ts');
   const routingModuleContent = (routingModule as any).toString();

   // Remove the first path, example: if string is 'src/app', remove 'src/'
   const routeBasePath = options.path.replace(/.*\//, '');
   if (!routingModuleContent.includes(`path: '${strings.dasherize(pluralize(options.label))}',`)) {
     const newRoutingModuleContent = routingModuleContent.replace('/* Add new routes here */',
       `/* Add new routes here */
         { path: '${strings.dasherize(pluralize(options.label))}', loadChildren: () => import('${routeBasePath}/${pluralize(strings.dasherize(options.name))}/${pluralize(strings.dasherize(options.name))}.module').then(m => m.${strings.classify(pluralize(options.name))}Module) },
       `
     );
     tree.overwrite('src\\app\\app.routing.ts', newRoutingModuleContent);
   }
}


function pluralize(word: string): string {
  return word + 's';
}

// Make kebab case but sapce instead of underscore and first letter in uppercase
function labelize(word: string): string {
  word = strings.dasherize(word);
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
