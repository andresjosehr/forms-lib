export interface EntityBuilderSchema {
  name: string,
  path: string,
  label: string,
  entitySchema: [
    {
      name: string,
      label: string,
      type: 'string' | 'number',
      inputType?: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'relatedEntity',
      relatedEntityPath?: string,
      relatedEntityName?: string,
      options?: string[],
      visible: boolean,
      editable: boolean,
      sqlProperties: {
        type: 'string' | 'integer' | 'relatedEntity',
        length?: number,
        nullable?: boolean,
        relatedEntity?: string,
      },
      validations: {
        front: string,
        back: string
      }
    }
  ],

}
