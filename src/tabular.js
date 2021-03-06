import { Meteor } from 'meteor/meteor';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import i18n from 'meteor/universe:i18n';
import Tabular from 'meteor/aldeed:tabular';
import { SubsManager } from 'meteor/thelohoadmin:subs-manager';
import { extend, union } from 'lodash';
import moment from 'moment';
import { Orgs } from './imports/api/organizations/organizations';
import { Persons } from './imports/api/persons/persons';
import { Contracts } from './imports/api/contracts/contracts';

if (Meteor.isClient) {
  import './imports/ui/components/contracts/contracts.html';
  import './imports/ui/pages/index/contracts.html';
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
    data: 'ocid',
    title: 'OCID',
    class: 'js-ocid',
  },
  {
    data: 'title',
    titleFn() { return i18n.__('Title'); },
    class: 'js-title',
  },
  {
    data: 'type',
    class: 'js-contract-type',
    titleFn() { return i18n.__('Type'); },
  },
  {
    data: 'start_date',
    class: 'js-start-date',
    titleFn() { return i18n.__('Start date'); },
    render: formatDate,
  },
  {
    data: 'end_date',
    class: 'js-end-date',
    titleFn() { return i18n.__('End date'); },
    render: formatDate,
  },
  {
    data: 'amount',
    class: 'js-amount',
    titleFn() { return i18n.__('Amount'); },
    render: formatAmount,
  },
  {
    data: 'currency',
    class: 'js-currency',
    titleFn() { return i18n.__('Currency'); },
  },
];

if (Meteor.isClient) {
  import { $ } from 'meteor/jquery';
  import './imports/ui/components/spin/spinner.html';
  import dataTablesBootstrap from 'datatables.net-bs';
  import 'datatables.net-bs/css/dataTables.bootstrap.css';

  dataTablesBootstrap(window, $);
  $.extend(true, $.fn.dataTable.defaults, {
    language: {
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
    extraFields: ['simple'],
    columns: [{
      data: 'name',
      titleFn() {
        return i18n.__('Name');
      },
      cellClass: 'name',
    },
    {
      data: 'description',
      titleFn() {
        return i18n.__('Description');
      },
      searchable: false,
    },
    {
      data: 'foundation_date',
      titleFn() {
        return i18n.__('Year Founded');
      },
      searchable: false,
    },
    {
      data: 'contract_count',
      titleFn() {
        return i18n.__('Contracts');
      },
      searchable: false,
    },
    {
      data: 'company.classification',
      titleFn() {
        return i18n.__('Primary Industry Classification');
      },
    },
    {
      data: 'source',
      titleFn() {
        return i18n.__('Source');
      },
      searchable: false,
    }],
  }),
);

TabularTables.Persons = new Tabular.Table(extend({},
  tableDefaults, {
    name: 'Persons',
    collection: Persons,
    extraFields: ['simple'],
    columns: [
      {
        data: 'name',
        titleFn() {
          return i18n.__('Name');
        },
        cellClass: 'name',
      },
      {
        data: 'source',
        titleFn() {
          return i18n.__('Source');
        },
      },
      {
        data: 'contract_count',
        titleFn() {
          return i18n.__('Contracts');
        },
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
    dom: '<\'row\'l>rt<\'bottom\'ip><\'clear\'>',
    columns: union(
      contractFields,
      [{

        data: 'dependency',
        titleFn() {
          return i18n.__('Dependency');
        },
        class: 'js-dependency',
      },
      {
        data: 'suppliers_org',
        titleFn() {
          return i18n.__('Suppliers');
        },
        class: 'js-suppliers',
        tmpl: Meteor.isClient && Template.suppliers_cell,
      },
      ]),
    extraFields: ['suppliers_person', 'suppliers'],
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
