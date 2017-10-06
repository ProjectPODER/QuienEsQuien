import moment from 'moment';
import {
  dropRight,
  mapValues,
  isString,
  isArray,
  snakeCase,
  values,
  uniq,
  mapKeys,
  camelCase,
} from 'lodash';
import {
  invalidValues,
  date_regex,
} from './variables';

const countriesArray = require('world-countries');

export function csv_multi_value_to_array(data) {
  return mapValues(data, function (value, key) {
    // convert semicolon seperated values to array
    if (isString(value) && /_array/.test(key)) {
      let array = value.split(';').map(s => (s.trim()));
      // remove garbage
      array = remove_ending_garbage(array);
      return array;
    }
    if (isString(value)) {
      return value.trim();
    }
    return value;
  });
}

export function nullify_invalid_values(data) {
  return mapValues(data, function (value, key, object) {
    // nullify invalid values
    if (invalidValues.indexOf(value) > -1) {
      return ''; // empty strings get rejected at validation
    }

    return value;
  });
}

export const remove_ending_garbage = function (array) {
  // Remove garbage from end of array.
  // Inner garbage might be a placehoder for association with
  // another array

  if (invalidValues.indexOf(array[array.length - 1]) > -1) {
    var a = dropRight(array);
    return remove_ending_garbage(a);
  } else {
    return array;
  }
};

export function convert_dates(data) {
  // filter 2: clean up arrays, convert dates
  return mapValues(data, function (value, key, object) {
    // convert dates
    if (/date/.test(key) && moment(value, 'MM/DD/YYYY').isValid()) {
      if (isArray(value)) {
        return value.map(x => (new Date(x)));
      }
      return new Date(value);
    }
    return value;
  });
}

function countries() {
  return countriesArray.map((o) => {
    const names = [];
    names.push(o.name.common);
    names.push(o.name.official);
    values(o.translations).forEach((i) => {
      names.push(i.official);
      names.push(i.common);
    });
    return {
      strings: uniq(names).map(s => (s.toLowerCase())),
      cca2: o.cca2,
    };
  });
}

export function getCountry(string) {
  const cs = countries();
  // case where `string` already is a countrycode
  const o = cs.filter(c => (c.cca2 === string))[0];
  if (o && isString(o.cca2) && o.cca2.length === 2) {
    return o;
  }
  if (isString(string)) {
    return cs.filter(c => (c.strings.indexOf(string.toLowerCase()) > -1))[0];
  }
  return null;
}

export function genOCDID(data) {
  let string = 'ocd-division/';
  if (data.country) {
    string += `country:${snakeCase(data.country)}/`;
  } else {
    return null;
  }
  if (data.state) {
    string += `state:${snakeCase(data.state)}/`;
  } else {
    return null;
  }
  if (data.city) {
    string += `city:${snakeCase(data.city)}/`;
  } else {
    return string;
  }
  if (data.zone) {
    string += `zone:${snakeCase(data.zone)}`;
  } else {
    return string;
  }
  return string;
}

export function joinNames(data) {
  return [
    data.nombre.trim(),
    data.apellido.trim(),
  ].join(' ');
}

export function getInitials(string) {
  return string.match(/\b(\w)/g).join('');
}

export function isInitials(string, initials) {
  return (initials === getInitials(string));
}

export function stripProtocol(string) {
  return string.replace(/.*?:\/\//g, '');
}

export function camelizeKeys(data) {
  return mapKeys(data, (value, key) => (camelCase(key)));
}
