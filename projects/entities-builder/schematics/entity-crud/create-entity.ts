import {
  Tree,
  apply,
  url,
  applyTemplates,
  move,
  mergeWith,
  SchematicContext,
} from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import { Entity, Field } from './entity.interface';
import { labelize, pluralize, pluralizeSpanish } from './global';

export function createEntity(
  entity: Entity,
  tree: Tree,
  context: SchematicContext
): Tree {
  // context
  // entity = checkForRelatedEntities(tree, entity);
  checkNewRoute(tree, entity);
  checkMenu(tree, entity);
  entity.fields = buildValidations(entity.fields);


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
      searchableList: entity.searchable_list,
      entity,
    }),
    move(
      normalize(
        `/${entity.frontend_path}/${pluralize(strings.dasherize(entity.name))}`
      )
    ),
  ]);

  return mergeWith(templateSource)(tree, context) as Tree;
}

// export function checkForRelatedEntities(tree: Tree, entity: Entity): Entity {
//   entity.fields = entity.fields.map((field) => {
//     if(field.inputType === 'relatedSelect') {

//       const entityName = field.relationshipProperties?.entity as string;

//       // search recursively in the entities folder for the entity
//       let relatedEntityPath = ''
//       tree.getDir('src').visit((path) => {
//         if(path.includes(pluralize(entityName)) && relatedEntityPath === '') {
//           relatedEntityPath = path;
//         }
//       });
//       relatedEntityPath = relatedEntityPath.replace(entityName+'.ts', '').replace('/src/', '');
//       return {
//         ...field,
//         relatedEntityPath,
//         relatedEntityName: strings.capitalize(entityName)
//       }
//     }
//     return field
//   }) as any;

//   return entity;
// }

export function checkNewRoute(tree: Tree, entity: Entity): void {
  // Add simple route inside app.routing.ts

  const routingModule = tree.read('src\\app\\app.routes.ts');

  const routingModuleContent = (routingModule as any).toString();

  // Remove the first path, example: if string is 'src/app', remove 'src/'
  const routeBasePath = entity.frontend_path.replace(/.*\//, '');

  if (
    !routingModuleContent.includes(
      `path: '${strings.dasherize(pluralize(entity.label))}',`
    )
  ) {
    const newRoutingModuleContent = routingModuleContent.replace(
      '/* Add new routes here */',
      `/* Add new routes here */
        { path: '${strings.dasherize(pluralizeSpanish(entity.label))}', loadChildren: () => import('${routeBasePath}/${pluralize(strings.dasherize(entity.name))}/${pluralize(strings.dasherize(entity.name))}.module').then(m => m.${strings.classify(pluralize(entity.name))}Module) },
      `
    );

    tree.overwrite('src\\app\\app.routes.ts', newRoutingModuleContent);
  }
}

export function checkMenu(tree: Tree, options: Entity): void {
  // Get file in src\app\mock-api\common\navigation\data.ts
  const navigationFile = tree.read(
    'src\\app\\mock-api\\common\\navigation\\data.ts'
  );

  // Check if file includes "id   : 'example',"

  if (
    navigationFile &&
    !navigationFile
      .toString()
      .includes(`id   : '${strings.dasherize(pluralize(options.name))}',`)
  ) {
    const navigationFileContent = navigationFile.toString();

    const newNavigationFileContent = navigationFileContent.replace(
      '/* Add new menu items here */',
      `// Begin ${options.code}
      {
         id   : '${strings.dasherize(pluralize(options.name))}',
         title: '${strings.capitalize(pluralizeSpanish(options.label))}',
         type : 'basic',
         // icon : 'email',
         link  : '/${strings.dasherize(pluralizeSpanish(options.label))}'
      },
      // End ${options.code}

       /* Add new menu items here */
     `
    );

    tree.overwrite(
      'src\\app\\mock-api\\common\\navigation\\data.ts',
      newNavigationFileContent
    );
  }
}

export function buildValidations(fields: Field[]): Field[] {

  return fields.map((field) => {
    let v = '';
    field.validations.forEach((validation) => {
      v += `${validation.front_validation}`;

      if (validation.extra_info) {
        v += `(${validation.extra_info})`;
      }
      v += ', ';
    });

    if(v.length > 0) {
      v = v.substring(0, v.length - 2);
      v = ', ' + v;
    }

    field['validations_string'] = v;

    return field;
  });
}
