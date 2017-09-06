import {
  sample,
  extend,
} from 'lodash';
import moment from 'moment';
import faker from 'faker';
import countries from 'world-countries';
import {
  Random,
} from 'meteor/random';
import {
  ContractSchema,
} from '../../../contracts/contracts.js';


faker.locale = 'en';

const fakePrivateRelations = [...Array(5).keys()]
  .map(() => faker.company.companyName());

const fakePublicRelations = [...Array(3).keys()]
  .map(() => faker.company.companyName());

const fakePersonNames = [...Array(5).keys()]
.map(() => faker.name.findName());

const FakeBoardData = {

  board_role: [
    'Product Applications Architect',
    'Dynamic Data Executive',
    'District Branding Director',
  ],
  board_department: ['Books', 'Music', 'Toys'],
  board_start_date: [
    new Date('2016-09-20T05:00:00.000Z'),
    new Date('2016-06-25T05:00:00.000Z'),
    new Date('2016-03-15T06:00:00.000Z'),
  ],
  board_end_date: [
    new Date('2016-10-05T05:00:00.000Z'),
    new Date('2016-03-09T06:00:00.000Z'),
    new Date('2016-10-04T05:00:00.000Z'),
  ],
};

export const FakeBoardOfOrg = extend({}, FakeBoardData, {
  board: [
    'Wilhelm Walsh', 'Joy West', 'Verona Bednar',
  ],
});

export const FakeBoardOfPerson = extend({}, FakeBoardData, {
  board: ['Barrows Inc', 'Streich and Sons', 'Rutherford and Sons'],
});

export const fakeRows = [...Array(3).keys()].map(n => ({
    // CONTRACT
  CONTRACT_ID_STRING: 263,
  CONTRACT_TITLE_STRING: faker.lorem.sentence(),
  CONTRACT_NUM_PROC_STRING: Random.id(),
  CONTRACT_DEPENDENCY_STRING: Random.choice(fakePublicRelations),
  CONTRACT_TYPE_PROC_STRING: Random.choice(ContractSchema.getAllowedValuesForKey('procedure_type')),
  CONTRACT_TYPE_STRING: 'Obra Pública',
  CONTRACT_REFERENCES_STRING: 'https://compranet.funcionpublica.gob.mx/esop/guest/go/opportunity/detail?opportunityId=695435',
  CONTRACT_PROVIDER_ORG_STRING: sample(fakePrivateRelations),
  CONTRACT_PROVIDER_PERSON_STRING: sample(fakePersonNames),
  CONTRACT_AMOUNT_STRING: faker.finance.amount(),
    // ORG
  ORG_NAME_STRING: fakePrivateRelations[n],
  ORG_SUBORGS_ARRAY: fakePrivateRelations.slice(0, 3).join(';'),
  ORG_PARENT_IMMEDIATE_STRING: '',
  ORG_PARENT_ARRAY: fakePrivateRelations[n],
  ORG_OTHER_NAMES_ARRAY: 'CALZADA',
  ORG_INITIALS_STRING: 'XYZ',
  ORG_COUNTRY_STRING: Random.choice(countries.map(c => (c.name.common))),
  ORG_STATE_STRING: faker.address.state(),
  ORG_CITY_STRING: faker.address.city(),
  ORG_ZONE_STRING: 'Ernesto Malda No 732',
  ORG_STREET_STRING: faker.address.streetAddress(),
  ORG_ZIPCODE_STRING: faker.address.zipCode(),
  ORG_PHONES_ARRAY: [...Array(2).keys()].map(() => faker.phone.phoneNumber()).join(';'),
  ORG_WEBSITE_STRING: faker.internet.domainName(),
  ORG_EMAILS_ARRAY: [...Array(2).keys()].map(() => faker.internet.email()).join(';'),
  ORG_FOUNDATION_YEAR_STRING: 1998,
  ORG_SHAREHOLDERS_ARRAY: [...Array(3).keys()].map(() => faker.company.companyName()).join(';'),
  ORG_SHAREHOLDERS_SHARES_ARRAY: [...Array(3).keys()].map(() => faker.random.number()).join(';'),
  ORG_SHAREHOLDERS_PERSONS_ARRAY: fakePersonNames.slice(0, 3).join(';'),
  ORG_SHAREHOLDERS_PERSONS_SHARES_ARRAY: [...Array(3).keys()].map(() => faker.random.number()).join(';'),
  ORG_LENDERS_ARRAY: [...Array(3).keys()].map(() => faker.company.companyName()).join(';'),
  ORG_INVESTMENTS_ARRAY: '',
  ORG_INVESTMENTS_PERCENT_ARRAY: '',
  ORG_PUBLIC_STRING: Random.choice(['Sí', 'No', '']),
  ORG_BOARD_ARRAY: fakePersonNames.slice(0, 3).join(';'),
  ORG_BOARD_ROLE_ARRAY: [...Array(3).keys()].map(() => faker.name.title()).join(';'),
  ORG_PROFESSIONAL_ARRAY: fakePersonNames.slice(0, 3).join(';'),
  ORG_PROFESSIONAL_ROLE_ARRAY: [...Array(3).keys()].map(() => faker.name.title()).join(';'),
  ORG_EMPLOYEES_STRING: faker.random.number(),
  ORG_REFERENCES_ARRAY: [
    'http://www.proceso.com.mx/457974/ruiz-esparza-entrega-a-consorcio-hank-rhon-contrato-4-9-mil-mdp',
    'http://www.ccicsa.com.mx',
    'http://www.eluniversal.com.mx/entrada-de-opinion/columna/mario-maldonado/cartera/2016/09/6/el-ex-directivo-de-ica-que-ahora-gana?fb_comment_id=1317851694894020_1318415831504273#f25918d9defb1c',
  ].join(';'),
    // PERSON
  PERSON_ID_STRING: faker.random.uuid(),
  PERSON_NAME_STRING: fakePersonNames[n],
  PERSON_PREFIX_ARRAY: faker.name.prefix(),
  PERSON_SUFFIX_ARRAY: faker.name.suffix(),
  PERSON_GENDER_STRING: Random.choice(['Male', 'Female']),
  PERSON_COUNTRY_ARRAY: faker.address.country(),
  PERSON_BOARD_ARRAY: fakePrivateRelations.slice(0, 2).join(';'),
  PERSON_BOARD_ROLE_ARRAY: [...Array(3).keys()].map(() => faker.name.title()).join(';'),
  PERSON_PUBLIC_ARRAY: fakePublicRelations.join(';'),
  PERSON_PUBLIC_ROLE_ARRAY: [...Array(3).keys()].map(() => faker.name.title()).join(';'),
  PERSON_PUBLIC_DEPARTMENT_ARRAY: faker.commerce.department(),
  PERSON_BOARD_START_DATE_ARRAY: [...Array(3).keys()].map(() => moment(faker.date.past()).format('l')).join(';'),
  PERSON_BOARD_END_DATE_ARRAY: [...Array(3).keys()].map(() => moment(faker.date.recent()).format('l')).join(';'),
  PERSON_PROFESSIONAL_ARRAY: fakePrivateRelations.slice(0, 2).join(';'),
  PERSON_PROFESSIONAL_ROLE_ARRAY: [...Array(3).keys()].map(() => faker.name.title()).join(';'),
  PERSON_PROFESSIONAL_START_DATE_ARRAY: [...Array(3).keys()].map(() => moment(faker.date.past()).format('l')).join(';'),
  PERSON_PROFESSIONAL_END_DATE_ARRAY: [...Array(3).keys()].map(() => moment(faker.date.recent()).format('l')).join(';'),
  PERSON_SHAREHOLDER_ARRAY: fakePrivateRelations.slice(0, 2),
  PERSON_SHAREHOLDER_SHARES_ARRAY: [...Array(3).keys()].map(() => faker.random.number()).join(';'),
  PERSON_SHAREHOLDER_START_DATE_ARRAY: [...Array(3).keys()].map(() => moment(faker.date.past()).format('l')).join(';'),
  PERSON_SHAREHOLDER_END_DATE_ARRAY: [...Array(3).keys()].map(() => moment(faker.date.recent()).format('l')).join(';'),
  PERSON_REFERENCES_ARRAY: [...Array(2).keys()].map(() => faker.internet.url()).join(';'),
    // META_PERSON_COUNT = 1 + fakePersonNames.length;
}));

export const testProviderPerson = {
  'ID PERSONA': '14',
  NAME: 'Senator William H. Frist;',
  PREFIX: '',
  SUFIX: '',
  GENDER: 'Hombre',
  NACIONALIDAD: 'Estados Unidos',
  MEMBERSHIP_NAME: 'Intensive HealthCare Corporation; Center for Strategic and International Studies Inc.; Africare; Millennium Challenge Corporation; George Kaiser Family Foundation; Aegis Sciences Corporation; Accolade Inc.; MDSave Incorporated; aTheraphy, Inc.; URS Corporation,Selected Medical Corporation; Selected Medical Holdings Corporation; AECOM; Teladoc Inc.; Cognosate LLC; Idx LLC',
  ROLE: 'Director Independiente; Administrador;Director; Director; Director; Director; Director; Director; Cofundador y Presidente; Cofundador y Presidente; Director Independiente; Director; Director Independiente y Miembro del Comité del Cuidado y Seguridad del Paciente; Director; Director Independiente, Presidente de calidad del comité de cuidado y seguridad del paciente y Miembro del comité de Nominaciones y Gobierno Corporativo;Director; Director',
  DEPARMENT: '',
  START_DATE: ';;;;;;;;;;2009;2010;2010; 2014; 2014;2014;2014',
  END_DATE: '',
  OWNERSHIP_NAME: '',
  SHARES: '',
  REFERENCES: 'http://www.bloomberg.com/research/stocks/private/person.asp?personId=3796016&privcapId=224917831 ',
};

export const testProviderPrivate = {
  'Id contrato': '2',
  Título: 'SERVICIOS DE SUPERVISIÓN TÉCNICA Y ADMINISTRATIVA DE CONSTRUCCIÓN PARA EL EDIFICIO TERMINAL DEL NUEVO AEROPUERTO INTERNACIONAL DE LA CIUDAD DE MEXICO',
  número_procedimiento: 'LO-009KDH999-E51-2016',
  tipo_procedimiento: 'Licitación Pública',
  tipo_contratación: 'Servicios Relacionados con la OP',
  anuncio: 'https://compranet.funcionpublica.gob.mx/esop/guest/go/opportunity/detail?opportunityId=852020',
  proveedor: 'INGENIERÍA Y ECONOMÍA DEL TRANSPORTE, S.A.',
  'Otros nombres': 'INECO',
  importe: '1157439743',
  país: 'España',
  estado: 'Madrid',
  'Delegación / municipio': faker.address.city(),
  Colonia: 'Parque San Andrés',
  calle: 'Paseo de la Habana 138',
  'código postal': '28036',
  teléfono: faker.phone.phoneNumber(),
  'sitio web': 'https://www.ineco.com/',
  'correo electrónico': faker.internet.email(),
  'año de fundación': '1970',
  'empresa matriz': faker.company.companyName(),
  subsidiarias: 'INGENIERÍA Y ECONOMÍA TRANSPORTMEX, S.A. DE C.V. (INECOMEX)',
  accionistas: 'Adif;Adif Alta velocidad;ENAIRE;Renfe',
  porcentaje: '10;1.5;16.67',
  prestamistas: '',
  inversiones: 'Tenemetro;CEAVMM;AIE Crida',
  'empresa pública': '',
  'junta directiva': 'Jesús Silva Fernández;Ana Rojo;Ignacio Fernández-Cuenca;José Manuel Tejera;Pablo Vázquez Vega;Gonzalo Jorge Ferré Moltó;Ignacio González Sánchez;Javier Marín San Andrés;Mariano Navas Gutiérrez;Ángel Luis Arias Serrano;Luis Izquierdo Labella;Manuel Martínez Cepeda;Violeta González Aleñar;Ignacio Garay Zabala;Miguel Ángel de Lera Losada;Alejandra Sánnchez Yánquez;Belén Bada de Cominges;María Aparici González;Almudena de la Peña Robles',
  cargos: 'Presidente de la junta directiva;Directora general de ingeniería y servicios;Director general corporativo;Director general de infraestructura y transportes;Consejero;Consejero;Consejero;Consejero;Consejero;Consejero;Consejero;Consejero;Consejero;Consejero;Consejero;Consejero;Consejero;Consejero;Secrettaria no consejera',
  directivos: '',
  dcargos: '',
  'número de empleados': '2500',
  'país de origen': '',
  observaciones: 'Subir los puestos de los consejeros en sus perfiles personales',
  fuentes: 'https://www.ineco.com/webineco/microsites/informes-anuales/2015/\nhttps://www.ineco.com/webineco/aviso-legal',
};
