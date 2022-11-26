import { Tree, Rule, apply, url, applyTemplates, move, chain, mergeWith } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import { EntityBuilderSchema } from './entity-builder';


export function entityCrudGenerator(options : EntityBuilderSchema): Rule {

  return (tree: Tree) => {

    // Get the file and read it
    const peopleJson = tree.readJson('src\\app\\entities-schemas\\'+ strings.dasherize(options.name) +'.json');
    options['entitySchema'] = peopleJson as any;


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
      mergeWith(templateSource)
    ])
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
