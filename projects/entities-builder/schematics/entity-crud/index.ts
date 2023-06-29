import { Tree, SchematicContext } from '@angular-devkit/schematics';
import { Options } from './options';
import { Entity } from './entity.interface';
import axios from 'axios';
import { createEntity } from './create-entity';
import { editEntity } from './edit-entity';

export function entityCrudGenerator(options: Options) {
  return async (tree: Tree, context: SchematicContext) => {

    try {

      const response = await axios.get(`${options.api}/api/get-entity/${options.entity}`);
      const entity: Entity = response.data.data;
      return handleExecution(entity, tree, context);

    } catch (error) {
      context.logger.error('Error occurred while generating entity CRUD', error as any);
      throw error;
    }
  };
}

function handleExecution(entity: Entity, tree: Tree, context: SchematicContext){

  if(!entity.built_creation){
    return createEntity(entity, tree, context);
  }

  if(entity.fields.some(field => field.built_edition) || entity.built_edition){
    return editEntity(entity, tree, context);
  }
  return tree;
}
