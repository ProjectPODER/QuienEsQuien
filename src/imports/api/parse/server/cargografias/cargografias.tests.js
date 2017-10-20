import {
  resetDatabase,
} from 'meteor/xolvio:cleaner';
import {
  assert,
} from 'chai';
import Papa from 'papaparse';
import fs from 'fs';
import Memberships from '../../../memberships/memberships';
import {
  camelizeKeys,
} from '../lib';
import {
  tmpOrgs,
  tmpPersons,
  resetTemporaryCollections,
} from '../index';
import fakeCargo from './cargografias.test-data';
import {
  validateBySchema,
} from './lib';
import {
  cargografiasSchema,
} from '../../schema';
import {
  cargografiasImportRow,
  getGender,
  orgMods,
  orgMembershipData,
  referenceData,
  personData,
} from './index';


const CSV_PATH = `${process.env.PWD}/tests/cargografias.csv`;
const CSV_DATA = fs.readFileSync(CSV_PATH, 'utf8');

const BP = Papa.parse(CSV_DATA, {
  delimiter: ',',
  header: true,
  preview: 5,
  encoding: 'UTF-8',
  skipEmptyLines: true,
});

describe('Cargografias CSV', () => {
  it('resembles specification.', () => {
    BP.data.forEach((row) => {
      validateBySchema(row, cargografiasSchema);
    });
  });
});

describe('Cargografias parsing functions', () => {
  beforeEach(() => {
    resetDatabase();
    resetTemporaryCollections();
  });

  it('return the correct gender when sex is `Hombre`', () => {
    const sex = 'Hombre';
    const gender = getGender(sex);
    assert.strictEqual(gender, 'Male');
  });

  it('return the correct gender when sex is `Mujer`', () => {
    const sex = 'Mujer';
    const gender = getGender(sex);
    assert.strictEqual(gender, 'Female');
  });

  it('returns references', () => {
    const m = referenceData(camelizeKeys(fakeCargo));
    const qualities = m.map(o => (o.quality));
    const chequeado = m.map(o => (o.chequeado));
    const urls = m.map(o => (o.url)).sort();

    const localUrls = [
      'www.cba.gov.ar/institucional/gobernadores-anteriores/',
      'www.justiciacordoba.gob.ar/jel/pdf/procesos/1998.12.20%20-%20Acta%20Escrutinio%20y%20Proclamaci%C3%B3n.pdf',
      'www.historiapolitica.com/datos/biblioteca/pyd_closa.pdf',
    ].sort();

    assert.strictEqual(m.length, 3);
    assert.deepEqual(qualities, ['oficial', 'oficial', 'oficial']);
    assert.deepEqual(chequeado, [true, true, true]);
    assert.deepEqual(urls, localUrls);
  });

  it('returns a membership based on `Organization` field', () => {
    const m = orgMembershipData(camelizeKeys(fakeCargo));
    assert.strictEqual(m.person, 'José Manuel De la Sota');
    assert.strictEqual(m.person_id, 'jose manuel de la sota');
    assert.strictEqual(m.sob_org, 'gobierno de la provincia de cordoba');
    assert.strictEqual(m.territory, 'Córdoba');
    // FIXME timestamps tests fail across timezones or small clock variations
    // assert.strictEqual(m.start_date.valueOf(), 934430400000);
    // assert.strictEqual(m.end_date.valueOf(), 1136782800000);
    assert.strictEqual(m.references.length, 3);
  });

  it('returns a person', () => {
    const o = personData(camelizeKeys(fakeCargo));
    assert.strictEqual(o.name, 'José Manuel De la Sota');
    assert.strictEqual(o.first_name, 'José Manuel');
    assert.strictEqual(o.family_name, 'De la Sota');
    assert.strictEqual(o.gender, 'Male');
    assert.strictEqual(o.imageUrl, 'https://pbs.twimg.com/profile_images/595969653433868288/BTF_rh5X.png');
  });

  it('returns modifiers for organizations', () => {
    const o = orgMods(camelizeKeys(fakeCargo));
    const mod = o[0];
    assert.strictEqual(mod.$setOnInsert.name, 'Gobierno de la Provincia de Córdoba');
    assert.strictEqual(mod.$setOnInsert.category, 'public');
  });
});

describe('Cargografias import', () => {
  beforeEach(() => {
    resetDatabase();
    resetTemporaryCollections();
  });

  it('populates tmp with persons', () => {
    BP.data.forEach((row) => {
      cargografiasImportRow(row);
    });
    if (tmpPersons.find().count() < 1) {
      throw new Error('no persons inserted');
    }
  });

  it('populates tmp with organizations', () => {
    BP.data.forEach((row) => {
      cargografiasImportRow(row);
    });
    if (tmpOrgs.find().count() < 1) {
      throw new Error('no organizations inserted');
    }
  });

  it('populates memberships', () => {
    BP.data.forEach((row) => {
      cargografiasImportRow(row);
    });
    // Memberships.find().forEach(m => (console.log(m)))
    if (Memberships.find().count() < 1) {
      throw new Error('no memberships inserted');
    }
  });
});
