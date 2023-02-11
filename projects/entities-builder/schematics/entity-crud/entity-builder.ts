export interface EntityBuilderSchema {
  name: string,
  path: string,
  label: string,
  searchableList?: boolean,
  entitySchema: [
    {
      name: string,
      label: string,
      type: 'string' | 'number',
      inputType?: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'relatedSelect',
      searchable?: boolean,
      relatedEntityPath?: string,
      relatedEntityName?: string,
      options?: string[],
      visible: boolean,
      editable: boolean,
      sqlProperties: {
        type: 'string' | 'integer' | 'relatedEntity',
        length?: number,
        nullable?: boolean
      },
      relationshipProperties?:{
        entity: string,
        column: string,
        type: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany',
      }
      validations: {
        front: string,
        back: string
      }
    }
  ],

}
