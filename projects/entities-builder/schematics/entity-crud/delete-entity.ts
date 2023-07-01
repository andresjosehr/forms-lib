import { Tree, SchematicContext } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { Entity } from './entity.interface';
import { pluralize, pluralizeSpanish } from './global';


export function deleteEntity(
  entity: Entity,
  tree: Tree,
  context: SchematicContext
): Tree {
  context

  tree = deleteRoute(tree, entity);
  tree = deleteMenu(tree, entity);

  const path =  `${entity.frontend_path}/${pluralize(strings.dasherize(entity.name))}/`;

  tree.getDir(path).visit(filePath => {
    tree.delete(filePath);
  });

  tree.delete(path);

  // Sea

  return tree;
}


function deleteRoute(tree: Tree, entity: Entity) {

  const routingModule = tree.read('src\\app\\app.routes.ts');
  const routingModuleContent = (routingModule as any).toString();
  const routeBasePath = entity.frontend_path.replace(/.*\//, '');

  const strToDelete = `{ path: '${strings.dasherize(pluralizeSpanish(entity.label))}', loadChildren: () => import('${routeBasePath}/${pluralize(strings.dasherize(entity.name))}/${pluralize(strings.dasherize(entity.name))}.module').then(m => m.${strings.classify(pluralize(entity.name))}Module) },`;
  const newRoutingModuleContent = routingModuleContent.replace(strToDelete, '');
  tree.overwrite('src\\app\\app.routes.ts', newRoutingModuleContent);

  return tree;
}


export function deleteMenu(tree: Tree, entity: Entity): Tree {
  // Get file in src\app\mock-api\common\navigation\data.ts
  const navigationFile = tree.read(
    'src\\app\\mock-api\\common\\navigation\\data.ts'
  );

  const navigationContent = (navigationFile as any).toString();
  let newNavigationContent = '';

  let includeLine = true;
  navigationContent.split('\n').forEach((line: string) => {
    if(line.includes(`// Begin ${entity.code}`) && includeLine){
      includeLine = false;
    }
    if(line.includes(`// End ${entity.code}`) && !includeLine){
      includeLine = true;
    }
    if(includeLine && !(line.includes(`// Begin ${entity.code}`) || line.includes(`// End ${entity.code}`))){
      newNavigationContent += line + '\n';
    }

  });


  tree.overwrite('src\\app\\mock-api\\common\\navigation\\data.ts', newNavigationContent);

  return tree;
}



