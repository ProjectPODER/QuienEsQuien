import { Meteor } from 'meteor/meteor';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import i18n from 'meteor/universe:i18n';
import Tabular from 'meteor/poder:cardular';
import { SubsManager } from 'meteor/thelohoadmin:subs-manager';
import { extend, union } from 'lodash';
import moment from 'moment';
import { Orgs } from './imports/api/organizations/organizations';
import { Persons } from './imports/api/persons/persons';
import { Contracts } from './imports/api/contracts/contracts';

if (Meteor.isClient) {
  import './imports/ui/components/contracts/contracts.html';
  import './imports/ui/pages/index/contracts.html';
  import './imports/ui/pages/index/persons.html';
  import './imports/ui/pages/index/organizations.html';
}

const TabularTables = {};

function formatDate(val) {
  if (val instanceof Date) {
    return moment(val).format('ll');
  }
  return 'N/A';
}

function formatAmount(value) {
  if (value) {
    return value.toLocaleString('en-UK',
      {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      });
  }
  return 'N/A';
}

const tableDefaults = {
  stateSave: true,
  sub: new SubsManager(),
  responsive: true,
  autoWidth: false,
  search: {
    smart: false,
  },
};

const contractFields = [
  {
    data: 'title',
    titleFn() { return i18n.__('Title'); },
    class: 'js-title no-title search-result-title col-m-8 col-8',
  },
  {
    data: 'amount',
    class: 'js-amount no-title search-result-emph col-m-4 col-4',
    title: "",
    tmpl: Meteor.isClient && Template.contract_amount,
    tmplContext(rowData) {
      return {
        item: rowData
      };
    }
  },
  {
    data: 'start_date',
    class: 'js-start-date inline-title search-result-mono-gray col-m-8 col-8',
    title: "",
    tmpl: Meteor.isClient && Template.contract_dates,
    tmplContext(rowData) {
      return {
        item: rowData
      };
    }
  },
  {
    data: 'ocid',
    title: 'OCID',
    class: 'js-ocid no-title col-2 col-m-2',
    tmpl: Meteor.isClient && Template.view_contract,
    tmplContext(rowData) {
      return {
        item: rowData,
        column: 'title'
      };
    }
  },
];

if (Meteor.isClient) {
  import { $ } from 'meteor/jquery';
  import './imports/ui/components/spin/spinner.html';
  import dataTablesBootstrap from 'datatables.net-bs';
  import 'datatables.net-bs/css/dataTables.bootstrap.css';
  
  dataTablesBootstrap(window, $);
  $.extend(true, $.fn.dataTable.defaults, {
    searching: false,
    dom: '<<"col-m-6"i><"col-m-6"l><"col-m-12"frtp><"clear">>',
    // info: false,
    language: {
      "info": "Mostrando _END_ de _TOTAL_ resultados",
      "lengthMenu": "Mostrar _MENU_ resultados",
      "paginate": {
      "previous": "Anterior",
      "next": "Siguiente",
    },
      processing: Blaze.toHTML(Template.loading),
    },
  });
}

TabularTables.Orgs = new Tabular.Table(extend({},
  tableDefaults, {
    name: 'Orgs',
    collection: Orgs,
    order: [
      [1, 'desc'],
    ],
    extraFields: ['contract_count', 'foundation_date', 'company.tickers', 'type', 'company.classification'],
    columns: [{
          data: 'name',
          titleFn() {
            return i18n.__('Name');
          },
          class: 'js-title no-title search-result-title col-m-8 col-8',
        },
        {
          data: 'simple',
          title: 'enlace',
          class: 'js-ocid no-title col-2 col-m-2',
          tmpl: Meteor.isClient && Template.view_organization,
          tmplContext(rowData) {
            return {
              item: rowData,
              column: 'title'
            };
          }
        },
        {
          data: 'contracts_fundation',
          class: 'col-m-8 col-8',
          title: "",
          tmpl: Meteor.isClient && Template.contracts_fundation,
          tmplContext(rowData) {
            return {
              item: rowData
            };
          }
        },
        {
          data: 'summary-data',
          class: 'col-m-8 col-8',
          title: "",
          tmpl: Meteor.isClient && Template.summary_data,
          tmplContext(rowData) {
            return {
              item: rowData
            };
          }
        },
    ],
  }),
);

TabularTables.Persons = new Tabular.Table(extend({},
  tableDefaults, {
    name: 'Persons',
    collection: Persons,
    extraFields: ['contract_count'],
    columns: [
      {
        data: 'name',
        titleFn() {
          return i18n.__('Name');
        },
        class: 'js-title no-title search-result-title col-m-8 col-8',
      },
      {
        data: 'simple',
        title: 'enlace',
        class: 'js-ocid no-title col-2 col-m-2',
        tmpl: Meteor.isClient && Template.view_person,
        tmplContext(rowData) {
          return {
            item: rowData,
            column: 'title'
          };
        }
      },
      {
        data: 'person-type',
        class: 'js-person-type col-m-8 col-8',
        title: "",
        tmpl: Meteor.isClient && Template.person_type,
        tmplContext(rowData) {
          return {
            item: rowData
          };
        }
      }],
  }),
);

TabularTables.Contracts = new Tabular.Table(extend({},
  tableDefaults, {
    name: 'Contracts',
    collection: Contracts,
    order: [
      [5, 'desc'],
    ],
    columns: union(
      contractFields,
      [{

        data: 'dependency',
        titleFn() {
          return i18n.__('Dependency');
        },
        class: 'js-dependency col-4 col-m-4',
        tmpl: Meteor.isClient && Template.dependency_cell,
      },
      {
        data: 'suppliers_org',
        titleFn() {
          return i18n.__('Suppliers');
        },
        class: 'js-suppliers col-4 col-m-4',
        tmpl: Meteor.isClient && Template.suppliers_cell,
      },
      ]),
    extraFields: ['suppliers_person', 'suppliers', 'end_date', 'currency'],
  }),
);

TabularTables.PrivateContracts = new Tabular.Table(extend({},
  tableDefaults, {
    name: 'PrivateContracts',
    collection: Contracts,
    order: [
      [5, 'desc'],
    ],
    columns: union(
      contractFields,
      [{
        data: 'dependency',
        titleFn() {
          return i18n.__('Dependency');
        },
        class: 'js-dependency',
      }],
    ),
  }),
);

TabularTables.PublicOrgContracts = new Tabular.Table(extend({},
  tableDefaults, {
    name: 'PublicOrgContracts',
    collection: Contracts,
    order: [
      [5, 'desc'],
    ],
    columns: union(
      contractFields,
      [{
        tmpl: Meteor.isClient && Template.suppliers_cell,
        data: 'suppliers_org',
        class: 'js-suppliers',
        titleFn() {
          return i18n.__('Supplier');
        },
      }],
    ),
    extraFields: ['suppliers_person', 'suppliers'],
  }),
);
