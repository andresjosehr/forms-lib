export interface Field {
  id: number;
  code: string;
  name: string;
  label: string;

  built_creation: number;
  built_edition: number;
  field_type_id: number;
  input_type_id: number;
  searchable: number;
  entity_id: number;
  visible: number;
  editable: number;
  created_at: string;
  updated_at: string;
  input_type: {
    id: number;
    name: string;
    created_at: string | null;
    updated_at: string | null;
  };
  field_type: {
    id: number;
    name: string;
    created_at: string | null;
    updated_at: string | null;
  };
  sql_properties: {
    id: number;
    sql_property_type_id: number;
    related_entity_id: number | null;
    related_entity: Entity;
    field_id: number;
    length: number | null;
    nullable: number;
    created_at: string;
    updated_at: string;
    sql_type: {
      id: number;
      name: string;
      created_at: string | null;
      updated_at: string | null;
    };
  };
  validations: Validation[],
  validations_string?: string;
  options: any[];
}

export interface Validation {
  id: number;
  name: string;
  label: string;
  extra_info: number;
  front_validation: number;
  back_validation: number;
  created_at: null;
  updated_at: null;
  pivot: {
    field_id: number;
    validation_id: number;
    value: string;
  };
}
export interface Entity {
  id: number;
  code: string;
  name: string;
  label: string;
  layout: number;
  built_creation: number;
  built_edition: number;
  frontend_path: string;
  searchable_list: number;
  app_id: number;
  created_at: string;
  updated_at: string;
  fields: Field[];
  relationships: any[];
}
