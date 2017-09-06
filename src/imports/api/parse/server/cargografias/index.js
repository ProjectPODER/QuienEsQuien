import { camelCase, mapKeys } from 'lodash';
import { personScheme } from './persons';
// import { simpleName } from '../../../lib';

export function addressData(data) {
  let state = data.territorio;
  if (state === 'Argentina') {
    state = null;
  }
  return {
    city: data.territorioExtendido,
    state,
    country: 'Argentina',
  };
}

export function cargografiasImportRow(data) {
  const camelized = mapKeys(data, (value, key) => (camelCase(key)));
  return personScheme(camelized);
}
