import {  Tree,  apply,  url,  applyTemplates,  move,  mergeWith,  SchematicContext,} from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import { Entity } from './entity.interface';
import { labelize, pluralize, pluralizeSpanish } from './global';
import { checkMenu } from './create-entity';
import { buildValidations, checkNewRoute } from './create-entity';

export function editEntity(
  entity: Entity,
  tree: Tree,
  context: SchematicContext
): Tree {

  // console.log("Entro en edición");

  checkNewRoute(tree, entity);
  checkMenu(tree, entity);
  entity.fields = buildValidations(entity.fields);

  const path =  `src/app/forms-${entity.layout}/${pluralize(strings.dasherize(entity.name))}`

  tree.getDir(path).visit(f => tree.delete(f) );
  tree.delete(path);

  const templateSource = apply(url(`./files/form-${entity.layout}`), [
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
    move(normalize(path)),
  ]);

  return mergeWith(templateSource)(tree, context) as Tree;
}

