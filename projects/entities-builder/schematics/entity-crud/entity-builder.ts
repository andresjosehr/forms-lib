export interface EntityBuilderSchema {
  name: string,
  path: string,
  label: string,
  entitySchema: [
    {
      name: string,
      nameSpanish: string,
      type: string,
      required: boolean,
    }
  ],

}
