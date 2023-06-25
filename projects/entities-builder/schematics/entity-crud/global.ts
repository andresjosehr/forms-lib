import { strings } from '@angular-devkit/core';

export function pluralize(word: string): string {
  return word + 's';
}

export function pluralizeSpanish(word: string): string {
  // Si la palabra termina en vocal, simplemente añade 's'
   if (/[aeiou]$/i.test(word)) {
       return word + 's';
   }
   // Si la palabra termina en 'z', cambia 'z' por 'ces'
   else if (/z$/i.test(word)) {
       return word.slice(0, -1) + 'ces';
   }
   // Si la palabra termina en 's', 'x' o 'j', añade 'es'
   else if (/[sxj]$/i.test(word)) {
       return word + 'es';
   }
   // Para palabras que terminan en consonante, simplemente añade 'es'
   else {
       return word + 'es';
   }
}


// Make kebab case but sapce instead of underscore and first letter in uppercase
export function labelize(word: string): string {
  word = strings.dasherize(word);
  return word.replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}
