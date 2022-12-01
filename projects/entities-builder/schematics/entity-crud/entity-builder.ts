export interface EntityBuilderSchema {
  name: string,
  path: string,
  label: string,
  entitySchema: [
    {
      name: string,
      label: string,
      type: string,
      visible: boolean,
      editable: boolean,
      sqlProperties: {
        type: string,
        length: number,
        nullable: boolean
      },
      validations: {
        front: string,
        back: string
      }
    }
  ],

}
