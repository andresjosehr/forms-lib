import { Tree, SchematicContext, Rule } from '@angular-devkit/schematics';
// import { strings } from '@angular-devkit/core';
import { Options } from './options';
// import { createEntity } from './create-entity';
// import { Entity } from './entity.interface';
import axios from 'axios';
import { Entity } from './entity.interface';
import { createEntity } from './create-entity';
import { Observable } from 'rxjs';


export function entityCrudGenerator(options: Options): Rule {

  return (tree: Tree, context: SchematicContext) => {
    const observer = new Observable<any>((observer) => {


      axios.get(`${options.api}/api/entities/${options.entity}`).then((res) => {
        const entity: Entity = res.data.data;

        observer.next(createEntity(entity, tree, context));
        observer.complete();
      });
      });

    return observer;
  };
}
