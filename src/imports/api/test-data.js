import faker from 'faker';
import { Random } from 'meteor/random';
import { ContractSchema } from './contracts/contracts.js';
import AddressSchema from './addresses/addresses';
import { simpleName } from './lib';

const validCountries = AddressSchema.getAllowedValuesForKey('country');
const validContractTypes = ContractSchema.getAllowedValuesForKey('type');
const validProcedureTypes = ContractSchema.getAllowedValuesForKey('procedure_type');
const validCurrencies = ContractSchema.getAllowedValuesForKey('currency');
faker.locale = 'es_MX';

const companies = [...Array(3).keys()].map(() =>
  (faker.company.companyName()),
);

const persons = [...Array(3).keys()].map(() =>
  (faker.name.findName()),
);

export const boardMembers = [...Array(3).keys()].map((c, i) => {
  return {
    sob_org: simpleName(companies[i]),
    role: faker.name.jobTitle(),
    department: 'board',
    person: persons[i],
    person_id: simpleName(persons[i]),
    start_date: faker.date.past(),
    end_date: faker.date.past(),
  };
});

export const shareHoldersOrgs = [...Array(2).keys()].map((c, i) => {
  return {
    sob_org: simpleName(companies[i]),
    role: 'shareholder',
    department: faker.name.jobArea(),
    org: companies[i + 1],
    org_id: simpleName(companies[i + 1]),
    start_date: faker.date.past(),
    end_date: faker.date.past(),
  };
});

export const sharesData = [...Array(2).keys()].map((c, i) => {
  return {
    org_id: simpleName(companies[i]),
    org: companies[i],
    role: 'shareholder',
    department: faker.name.jobArea(),
    sob_org: simpleName(companies[i + 1]),
    start_date: faker.date.past(),
    end_date: faker.date.past(),
  };
});

export const shareHoldersPersons = [...Array(1).keys()].map((c, i) => {
  return {
    sob_org: simpleName(companies[i]),
    role: 'shareholder',
    department: faker.name.jobArea(),
    person: persons[i],
    person_id: simpleName(persons[i]),
    start_date: faker.date.past(),
    end_date: faker.date.past(),
  };
});

export const shareHolders = [...Array(3).keys()].map((c, i) => {
  return {
    sob_org: companies[i],
    role: 'shareholder',
    person: persons[i],
    person_id: simpleName(persons[i]),
    start_date: faker.date.past(),
    end_date: faker.date.past(),
  };
});

export const testOrgs = [...Array(3).keys()].map((c, i) => {
  return {
    simple: simpleName(companies[i]),
    names: [companies[i]],
    name: companies[i],
    category: 'company',
    source: 'BMV',
    foundation_date: 1945,
    description: faker.lorem.sentence(),
    address: {
      street: faker.address.streetAddress(),
      city: faker.address.city(),
      postal_code: faker.address.zipCode(),

      country: Random.choice(validCountries),
      telephone: faker.phone.phoneNumber(),
      website: faker.internet.url(),
    },
  };
});

export const test_org = {
  simple: 'aeroports de paris societe anonyme',
  names: ['Aéroports de Paris Société Anonyme'],
  name: 'Aéroports de Paris Société Anonyme',
  category: 'company',
  source: 'BMV',
  foundation_date: 1945,
  description: 'Aéroports de Paris Société Anonyme owns and operates Paris-Charles de Gaulle, Paris-Orly, and Paris-Le Bourget airports in the Îlede-France region, France.',
  address: {
    street: '291 boulevard Raspail',
    city: 'Paris',
    postal_code: '75014',
    country: 'FR',
    telephone: '33 1 43 35 70 00',
    website: 'www.aeroportsdeparis.fr',
  },
};

export const testPersons = [...Array(3).keys()].map((c, i) => {
  return {
    simple: simpleName(persons[i]),
    names: [persons[i]],
    name: persons[i],
    address: {
      street: faker.address.streetAddress(),
      city: faker.address.city(),
      postal_code: faker.address.zipCode(),
      country: Random.choice(validCountries),
      telephone: faker.phone.phoneNumber(),
      website: faker.internet.url(),
    },
  };
});

export const test_person = {
  name: 'Juan Maximiliano Benavides Feliú',
  simple: 'juan maximiliano benavides feliu',
  names: ['Juan Maximiliano Benavides Feliú'],
  source: 'BMV',
};
const OCIDS = [
  'OCDS-0UD2Q6-LO-009JZL014-N10-2013',
  'OCDS-0UD2Q6-SA-018T0O999-N47-2014',
  'OCDS-0UD2Q6-SA-011MAX001-N260-2015',
  'OCDS-0UD2Q6-SO-914036996-N84-2015',
  'OCDS-0UD2Q6-AA-018TOQ807-N40-2014',
];

const dates = [
  [new Date('01/27/2013'), new Date('04/27/2013')],
  [new Date('05/7/2014'), new Date('04/27/2016')],
  [new Date('04/11/2013'), new Date('05/26/2015')],
  [new Date('04/11/2013'), new Date('05/26/2015')],
  [new Date('05/7/2014'), new Date('04/27/2016')],
];

export const testContracts = [...Array(3).keys()].map((c, i) => ({
  dependency: companies[i],
  department: companies[i],
  ocid: OCIDS[i],
  procedure_type: Random.choice(validProcedureTypes),
  type: Random.choice(validContractTypes),
  status: faker.lorem.word(),
  clave_uc: faker.lorem.word(),
  start_date: dates[i][0],
  end_date: dates[i][1],
  title: faker.lorem.sentence(),
  amount: faker.finance.amount(),
  currency: Random.choice(validCurrencies),
  suppliers: [simpleName(companies[i])],
  suppliers_org: [
    ...Array(2).keys(),
  ].map(() => (simpleName(companies[i]))),
  suppliers_person: [
    ...Array(2).keys(),
  ].map(() => (simpleName(persons[i]))),
  company_status: faker.lorem.word(),
  account_admin: faker.name.prefix(),
  references: [
    {
      url: 'compranet.funcionpublica.gob.mx/esop/guest/go/opportunity/detail?opportunityId=319831',
    },
  ],
}));


export const test_contract = {
  'dependency': 'Administración Federal De Servicios Educativos En El Distrito Federal',
  'department': 'AFSEDF-ADMINISTRACIÓN FEDERAL DE SERVICIOS EDUCATIVOS EN EL DISTRITO FEDERAL 011C00999',
  'ocid': 'OCDS-0UD2Q6-AA-011C00999-N195-2013',
  'procedure_type': 'Adjudicación Directa Federal',
  'type': 'Adquisiciones',
  'status': 'Terminado',
  'clave_uc': '011C00999',
  'start_date': new Date('2013-10-31T00:00:00Z'),
  'end_date': new Date('2013-11-15T00:00:00Z'),
  'title': 'ADQUISICION DE MATERIALES',
  'amount': 334241.75,
  'currency': 'MXN',
  'country': 'MX',
  'company_status': 'HABILITADO',
  'account_admin': 'UC',
  'references': [
    'https://compranet.funcionpublica.gob.mx/esop/guest/go/opportunity/detail?opportunityId=319831',
  ],
};

export const testSample = {
  organizations: testOrgs,
  persons: testPersons,
  contracts: testContracts,
}
