import { Tree, apply, url, applyTemplates, move, chain, mergeWith, SchematicContext } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import { Entity } from './entity.interface';
import { labelize, pluralize, pluralizeSpanish } from './global';



export function createEntity(entity: Entity, tree: Tree, context: SchematicContext){
    entity = checkForRelatedEntities(tree, entity);
    checkNewRoute(tree, entity);
    checkMenu(tree, entity);
    console.log(15)

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
    console.log(16)


    chain([
      mergeWith(templateSource),
    ])(tree, context);

    return tree;
}

export function checkForRelatedEntities(tree: Tree, entity: Entity): Entity {
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

function checkNewRoute(tree: Tree, entity: Entity): void{
  // Add simple route inside app.routing.ts
  console.log(1)
  const routingModule = tree.read('src\\app\\app.routes.ts');
  console.log(2)

  const routingModuleContent = (routingModule as any).toString();
  console.log(3)

  // Remove the first path, example: if string is 'src/app', remove 'src/'
  const routeBasePath = entity.frontend_path.replace(/.*\//, '');
  console.log(4)
  if (!routingModuleContent.includes(`path: '${strings.dasherize(pluralize(entity.label))}',`)) {
    console.log(5)
    const newRoutingModuleContent = routingModuleContent.replace('/* Add new routes here */',
      `/* Add new routes here */
        { path: '${strings.dasherize(pluralizeSpanish(entity.label))}', loadChildren: () => import('${routeBasePath}/${pluralize(strings.dasherize(entity.name))}/${pluralize(strings.dasherize(entity.name))}.module').then(m => m.${strings.classify(pluralize(entity.name))}Module) },
      `
    );
    console.log(6)
    tree.overwrite('src\\app\\app.routes.ts', newRoutingModuleContent);
    console.log(7)
  }
  console.log(8)
}

function checkMenu(tree: Tree, options: Entity): void {
  console.log(9)
 // Get file in src\app\mock-api\common\navigation\data.ts
 const navigationFile = tree.read('src\\app\\mock-api\\common\\navigation\\data.ts');
 console.log(10)

 // Check if file includes "id   : 'example',"

 if (navigationFile && !navigationFile.toString().includes(`id   : '${strings.dasherize(pluralize(options.name))}',`)) {
  console.log(11)

   const navigationFileContent = navigationFile.toString();
   console.log(12)
   const newNavigationFileContent = navigationFileContent.replace('/* Add new menu items here */',
     `{
         id   : '${strings.dasherize(pluralize(options.name))}',
         title: '${strings.capitalize(pluralizeSpanish(options.label))}',
         type : 'basic',
         // icon : 'email',
         link  : '/${strings.dasherize(pluralizeSpanish(options.label))}'
      },

       /* Add new menu items here */
     `
   );
   console.log(13)
   tree.overwrite('src\\app\\mock-api\\common\\navigation\\data.ts', newNavigationFileContent);
   console.log(14)
 }

}

