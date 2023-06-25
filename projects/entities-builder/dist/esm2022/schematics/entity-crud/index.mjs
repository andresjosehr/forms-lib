import { apply, url, applyTemplates, move, chain, mergeWith } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
export function entityCrudGenerator(options) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zY2hlbWF0aWNzL2VudGl0eS1jcnVkL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBYyxLQUFLLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBb0IsTUFBTSw0QkFBNEIsQ0FBQztBQUM5SCxPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBSzFELE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxPQUFnQjtJQUVsRCxPQUFPLENBQUMsSUFBVSxFQUFFLE9BQXlCLEVBQUUsRUFBRTtRQUUvQyxJQUFJLE1BQU0sQ0FBQztRQUNYLElBQUcsT0FBTyxDQUFDLElBQUksRUFBRTtZQUNmLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDeEMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsOEJBQThCLEdBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRSxPQUFPLENBQVEsQ0FBQztTQUNqRztRQUVELElBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUNqQixNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDckM7UUFHRCwwQ0FBMEM7UUFDMUMsa0NBQWtDO1FBQ2xDLG9EQUFvRDtRQUNwRCxNQUFNLEdBQUcsdUJBQXVCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQy9DLGFBQWEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDNUIsU0FBUyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUd4QixNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzNDLGNBQWMsQ0FB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O0FBRUgsQ0FBQztBQUdELFNBQVMsU0FBUyxDQUFDLElBQVk7SUFDN0IsT0FBTyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ3BCLENBQUM7QUFFRCxnRkFBZ0Y7QUFDaEYsU0FBUyxRQUFRLENBQUMsSUFBWTtJQUM1QixJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDO1NBQzVDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO1NBQ3BCLFdBQVcsRUFBRSxDQUFDO0FBQ25CLENBQUM7QUFHRCxTQUFTLGdCQUFnQixDQUFDLElBQVk7SUFDcEMsdURBQXVEO0lBQ3ZELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQzlHLE9BQU8sSUFBSSxHQUFHLEdBQUcsQ0FBQztLQUNuQjtJQUVELDREQUE0RDtJQUM1RCxPQUFPLElBQUksR0FBRyxJQUFJLENBQUM7QUFDckIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRyZWUsIFJ1bGUsIGFwcGx5LCB1cmwsIGFwcGx5VGVtcGxhdGVzLCBtb3ZlLCBjaGFpbiwgbWVyZ2VXaXRoLCBTY2hlbWF0aWNDb250ZXh0IH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xyXG5pbXBvcnQgeyBzdHJpbmdzLCBub3JtYWxpemUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XHJcbmltcG9ydCB7IEVudGl0eUJ1aWxkZXJTY2hlbWEgfSBmcm9tICcuL2VudGl0eS1idWlsZGVyJztcclxuaW1wb3J0IHsgT3B0aW9ucyB9IGZyb20gJy4vb3B0aW9ucyc7XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVudGl0eUNydWRHZW5lcmF0b3Iob3B0aW9uczogT3B0aW9ucyk6IFJ1bGUge1xyXG5cclxuICByZXR1cm4gKHRyZWU6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcclxuXHJcbiAgICBsZXQgZW50aXR5O1xyXG4gICAgaWYob3B0aW9ucy5maWxlKSB7XHJcbiAgICAgIGNvbnN0IG5hbWUgPSBvcHRpb25zLm5hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgZW50aXR5ID0gdHJlZS5yZWFkSnNvbignc3JjXFxcXGFwcFxcXFxlbnRpdGllcy1zY2hlbWFzXFxcXCcrIHN0cmluZ3MuZGFzaGVyaXplKG5hbWUpICsnLmpzb24nKSBhcyBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYob3B0aW9ucy5lbnRpdHkpIHtcclxuICAgICAgZW50aXR5ID0gSlNPTi5wYXJzZShvcHRpb25zLmVudGl0eSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIGVudGl0eVsnZW50aXR5U2NoZW1hJ10gPSBlbnRpdHkuZmllbGRzO1xyXG4gICAgLy8gZW50aXR5WydsYWJlbCddID0gZW50aXR5LmxhYmVsO1xyXG4gICAgLy8gZW50aXR5WydzZWFyY2hhYmxlTGlzdCddID0gZW50aXR5LnNlYXJjaGFibGVMaXN0O1xyXG4gICAgZW50aXR5ID0gY2hlY2tGb3JSZWxhdGVkRW50aXRpZXModHJlZSwgZW50aXR5KTtcclxuICAgIGNoZWNrTmV3Um91dGUodHJlZSwgZW50aXR5KTtcclxuICAgIGNoZWNrTWVudSh0cmVlLCBlbnRpdHkpO1xyXG5cclxuXHJcbiAgICBjb25zdCB0ZW1wbGF0ZVNvdXJjZSA9IGFwcGx5KHVybCgnLi9maWxlcycpLCBbXHJcbiAgICAgIGFwcGx5VGVtcGxhdGVzKHtcclxuICAgICAgICBjbGFzc2lmeTogc3RyaW5ncy5jbGFzc2lmeSxcclxuICAgICAgICBkYXNoZXJpemU6IHN0cmluZ3MuZGFzaGVyaXplLFxyXG4gICAgICAgIGNhcGl0YWxpemU6IHN0cmluZ3MuY2FwaXRhbGl6ZSxcclxuICAgICAgICBjYW1lbGl6ZTogc3RyaW5ncy5jYW1lbGl6ZSxcclxuICAgICAgICBsYWJlbGl6ZTogbGFiZWxpemUsXHJcbiAgICAgICAgcGx1cmFsaXplU3BhbmlzaDogcGx1cmFsaXplU3BhbmlzaCxcclxuICAgICAgICBwbHVyYWxpemU6IHBsdXJhbGl6ZSxcclxuICAgICAgICBuYW1lOiBlbnRpdHkubmFtZSxcclxuICAgICAgICBsYWJlbDogZW50aXR5LmxhYmVsLFxyXG4gICAgICAgIHNlYXJjaGFibGVMaXN0OiBlbnRpdHkuc2VhcmNoYWJsZUxpc3QsXHJcbiAgICAgICAgZW50aXR5XHJcbiAgICAgIH0pLFxyXG4gICAgICBtb3ZlKG5vcm1hbGl6ZShgLyR7ZW50aXR5LmZyb250ZW5kX3BhdGh9LyR7cGx1cmFsaXplKHN0cmluZ3MuZGFzaGVyaXplKGVudGl0eS5uYW1lKSl9YCkpXHJcbiAgICBdKTtcclxuXHJcblxyXG4gICAgcmV0dXJuIGNoYWluKFtcclxuICAgICAgbWVyZ2VXaXRoKHRlbXBsYXRlU291cmNlKSxcclxuICAgIF0pKHRyZWUsIGNvbnRleHQpO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNoZWNrRm9yUmVsYXRlZEVudGl0aWVzKHRyZWU6IFRyZWUsIGVudGl0eTogRW50aXR5QnVpbGRlclNjaGVtYSk6IEVudGl0eUJ1aWxkZXJTY2hlbWEge1xyXG4gIGVudGl0eS5maWVsZHMgPSBlbnRpdHkuZmllbGRzLm1hcCgoZmllbGQpID0+IHtcclxuICAgIGlmKGZpZWxkLmlucHV0VHlwZSA9PT0gJ3JlbGF0ZWRTZWxlY3QnKSB7XHJcblxyXG4gICAgICBjb25zdCBlbnRpdHlOYW1lID0gZmllbGQucmVsYXRpb25zaGlwUHJvcGVydGllcz8uZW50aXR5IGFzIHN0cmluZztcclxuXHJcbiAgICAgIC8vIHNlYXJjaCByZWN1cnNpdmVseSBpbiB0aGUgZW50aXRpZXMgZm9sZGVyIGZvciB0aGUgZW50aXR5XHJcbiAgICAgIGxldCByZWxhdGVkRW50aXR5UGF0aCA9ICcnXHJcbiAgICAgIHRyZWUuZ2V0RGlyKCdzcmMnKS52aXNpdCgocGF0aCkgPT4ge1xyXG4gICAgICAgIGlmKHBhdGguaW5jbHVkZXMocGx1cmFsaXplKGVudGl0eU5hbWUpKSAmJiByZWxhdGVkRW50aXR5UGF0aCA9PT0gJycpIHtcclxuICAgICAgICAgIHJlbGF0ZWRFbnRpdHlQYXRoID0gcGF0aDtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICByZWxhdGVkRW50aXR5UGF0aCA9IHJlbGF0ZWRFbnRpdHlQYXRoLnJlcGxhY2UoZW50aXR5TmFtZSsnLnRzJywgJycpLnJlcGxhY2UoJy9zcmMvJywgJycpO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIC4uLmZpZWxkLFxyXG4gICAgICAgIHJlbGF0ZWRFbnRpdHlQYXRoLFxyXG4gICAgICAgIHJlbGF0ZWRFbnRpdHlOYW1lOiBzdHJpbmdzLmNhcGl0YWxpemUoZW50aXR5TmFtZSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZpZWxkXHJcbiAgfSkgYXMgYW55O1xyXG5cclxuICByZXR1cm4gZW50aXR5O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjaGVja05ld1JvdXRlKHRyZWU6IFRyZWUsIGVudGl0eTogRW50aXR5QnVpbGRlclNjaGVtYSk6IHZvaWR7XHJcbiAgIC8vIEFkZCBzaW1wbGUgcm91dGUgaW5zaWRlIGFwcC5yb3V0aW5nLnRzXHJcblxyXG4gICBjb25zdCByb3V0aW5nTW9kdWxlID0gdHJlZS5yZWFkKCdzcmNcXFxcYXBwXFxcXGFwcC5yb3V0ZXMudHMnKTtcclxuXHJcbiAgIGNvbnN0IHJvdXRpbmdNb2R1bGVDb250ZW50ID0gKHJvdXRpbmdNb2R1bGUgYXMgYW55KS50b1N0cmluZygpO1xyXG5cclxuICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBwYXRoLCBleGFtcGxlOiBpZiBzdHJpbmcgaXMgJ3NyYy9hcHAnLCByZW1vdmUgJ3NyYy8nXHJcbiAgIGNvbnN0IHJvdXRlQmFzZVBhdGggPSBlbnRpdHkuZnJvbnRlbmRfcGF0aC5yZXBsYWNlKC8uKlxcLy8sICcnKTtcclxuICAgaWYgKCFyb3V0aW5nTW9kdWxlQ29udGVudC5pbmNsdWRlcyhgcGF0aDogJyR7c3RyaW5ncy5kYXNoZXJpemUocGx1cmFsaXplKGVudGl0eS5sYWJlbCkpfScsYCkpIHtcclxuICAgICBjb25zdCBuZXdSb3V0aW5nTW9kdWxlQ29udGVudCA9IHJvdXRpbmdNb2R1bGVDb250ZW50LnJlcGxhY2UoJy8qIEFkZCBuZXcgcm91dGVzIGhlcmUgKi8nLFxyXG4gICAgICAgYC8qIEFkZCBuZXcgcm91dGVzIGhlcmUgKi9cclxuICAgICAgICAgeyBwYXRoOiAnJHtzdHJpbmdzLmRhc2hlcml6ZShwbHVyYWxpemUoZW50aXR5LmxhYmVsKSl9JywgbG9hZENoaWxkcmVuOiAoKSA9PiBpbXBvcnQoJyR7cm91dGVCYXNlUGF0aH0vJHtwbHVyYWxpemUoc3RyaW5ncy5kYXNoZXJpemUoZW50aXR5Lm5hbWUpKX0vJHtwbHVyYWxpemUoc3RyaW5ncy5kYXNoZXJpemUoZW50aXR5Lm5hbWUpKX0ubW9kdWxlJykudGhlbihtID0+IG0uJHtzdHJpbmdzLmNsYXNzaWZ5KHBsdXJhbGl6ZShlbnRpdHkubmFtZSkpfU1vZHVsZSkgfSxcclxuICAgICAgIGBcclxuICAgICApO1xyXG4gICAgIHRyZWUub3ZlcndyaXRlKCdzcmNcXFxcYXBwXFxcXGFwcC5yb3V0ZXMudHMnLCBuZXdSb3V0aW5nTW9kdWxlQ29udGVudCk7XHJcbiAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY2hlY2tNZW51KHRyZWU6IFRyZWUsIG9wdGlvbnM6IEVudGl0eUJ1aWxkZXJTY2hlbWEpOiB2b2lkIHtcclxuICAvLyBHZXQgZmlsZSBpbiBzcmNcXGFwcFxcbW9jay1hcGlcXGNvbW1vblxcbmF2aWdhdGlvblxcZGF0YS50c1xyXG4gIGNvbnN0IG5hdmlnYXRpb25GaWxlID0gdHJlZS5yZWFkKCdzcmNcXFxcYXBwXFxcXG1vY2stYXBpXFxcXGNvbW1vblxcXFxuYXZpZ2F0aW9uXFxcXGRhdGEudHMnKTtcclxuXHJcbiAgLy8gQ2hlY2sgaWYgZmlsZSBpbmNsdWRlcyBcImlkICAgOiAnZXhhbXBsZScsXCJcclxuXHJcbiAgaWYgKG5hdmlnYXRpb25GaWxlICYmICFuYXZpZ2F0aW9uRmlsZS50b1N0cmluZygpLmluY2x1ZGVzKGBpZCAgIDogJyR7c3RyaW5ncy5kYXNoZXJpemUocGx1cmFsaXplKG9wdGlvbnMubmFtZSkpfScsYCkpIHtcclxuXHJcbiAgICBjb25zdCBuYXZpZ2F0aW9uRmlsZUNvbnRlbnQgPSBuYXZpZ2F0aW9uRmlsZS50b1N0cmluZygpO1xyXG4gICAgY29uc3QgbmV3TmF2aWdhdGlvbkZpbGVDb250ZW50ID0gbmF2aWdhdGlvbkZpbGVDb250ZW50LnJlcGxhY2UoJy8qIEFkZCBuZXcgbWVudSBpdGVtcyBoZXJlICovJyxcclxuICAgICAgYHtcclxuICAgICAgICAgIGlkICAgOiAnJHtzdHJpbmdzLmRhc2hlcml6ZShwbHVyYWxpemUob3B0aW9ucy5uYW1lKSl9JyxcclxuICAgICAgICAgIHRpdGxlOiAnJHtzdHJpbmdzLmNhcGl0YWxpemUocGx1cmFsaXplKG9wdGlvbnMubGFiZWwpKX0nLFxyXG4gICAgICAgICAgdHlwZSA6ICdiYXNpYycsXHJcbiAgICAgICAgICAvLyBpY29uIDogJ2VtYWlsJyxcclxuICAgICAgICAgIGxpbmsgIDogJy8ke3N0cmluZ3MuZGFzaGVyaXplKHBsdXJhbGl6ZShvcHRpb25zLmxhYmVsKSl9J1xyXG4gICAgICAgfSxcclxuXHJcbiAgICAgICAgLyogQWRkIG5ldyBtZW51IGl0ZW1zIGhlcmUgKi9cclxuICAgICAgYFxyXG4gICAgKTtcclxuICAgIHRyZWUub3ZlcndyaXRlKCdzcmNcXFxcYXBwXFxcXG1vY2stYXBpXFxcXGNvbW1vblxcXFxuYXZpZ2F0aW9uXFxcXGRhdGEudHMnLCBuZXdOYXZpZ2F0aW9uRmlsZUNvbnRlbnQpO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBwbHVyYWxpemUod29yZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gd29yZCArICdzJztcclxufVxyXG5cclxuLy8gTWFrZSBrZWJhYiBjYXNlIGJ1dCBzYXBjZSBpbnN0ZWFkIG9mIHVuZGVyc2NvcmUgYW5kIGZpcnN0IGxldHRlciBpbiB1cHBlcmNhc2VcclxuZnVuY3Rpb24gbGFiZWxpemUod29yZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICB3b3JkID0gc3RyaW5ncy5kYXNoZXJpemUod29yZCk7XHJcbiAgcmV0dXJuIHdvcmQucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxICQyJylcclxuICAgIC5yZXBsYWNlKC9cXHMrL2csICctJylcclxuICAgIC50b0xvd2VyQ2FzZSgpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcGx1cmFsaXplU3BhbmlzaCh3b3JkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIC8vIElmIHRoZSB3b3JkIGVuZHMgd2l0aCBhIHZvY2FsLCBhZGQgYW4gJ3MnIGF0IHRoZSBlbmRcclxuICBpZiAod29yZC5lbmRzV2l0aCgnYScpIHx8IHdvcmQuZW5kc1dpdGgoJ2UnKSB8fCB3b3JkLmVuZHNXaXRoKCdpJykgfHwgd29yZC5lbmRzV2l0aCgnbycpIHx8IHdvcmQuZW5kc1dpdGgoJ3UnKSkge1xyXG4gICAgcmV0dXJuIHdvcmQgKyAncyc7XHJcbiAgfVxyXG5cclxuICAvLyBJZiB0aGUgd29yZCBlbmRzIHdpdGggYSBjb25zb25hbnQsIGFkZCBhbiAnZXMnIGF0IHRoZSBlbmRcclxuICByZXR1cm4gd29yZCArICdlcyc7XHJcbn1cclxuIl19