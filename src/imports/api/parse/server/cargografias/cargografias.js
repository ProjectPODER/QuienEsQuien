import {
  csv_multi_value_to_array,
  nullify_invalid_values,
  convert_dates
} from './lib.js';
import { simpleName } from '../../lib.js';
import { PersonSchema } from '../../persons/schema.js';
import { OrganizationSchema } from '../../organizations/schema.js';
import { snakeCase, mapKeys } from 'lodash';

export function memberOfOrganizationData( data ) {
  let name = [ data.nombre.trim(), data.apellido.trim() ].join(' ')
  return {
    name: name,
    role: data.cargo_nominal,
    start_date: data.fechaInicio,
    final_date: data.fechaFin,
  };
}

export function personBelongsToData(data) {
  return {
    name: data.organizacion,
    role: data.cargo_nominal,
    start_date: data.fechaInicio,
    final_date: data.fechaFin,
  };
}
