import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
// import Pikaday from 'pikaday';
import rangeslider from 'rangeslider.js';
import moment from 'moment';
import numbro from 'numbro';
// import 'pikaday/css/pikaday.css';
import 'rangeslider.js/dist/rangeslider.css';
import {
  debounce,
  uniqBy,
  isEmpty,
  remove,
  groupBy,
} from 'lodash';
import {
  DocHead
} from 'meteor/kadira:dochead';
import {
  contractIndexMinMax,
} from '../../../api/contracts/methods';
import {
  contractSearchOperator,
} from '../../components/contracts/lib';
import {
  simpleName,
} from '../../../api/lib';
import './contracts.html';
import TabularTables from '../../../../tabular.js';

Template.Contracts.onCreated(function() {
  const self = this;
  DocHead.setTitle('QuiénEsQuién.Wiki - Contracts');

  self.TabularTables = TabularTables;

  self.ready = new ReactiveVar(false);
  self.filters = new ReactiveVar([]);

  self.search = new ReactiveDict();
  self.defaults = new ReactiveDict();

  self.search.set('type', 'all');
  self.search.set('min_amount', 0);
  self.search.set('max_amount', 600000000);
  self.search.set('dependency', []);
  self.search.set('supplier', []);
  contractIndexMinMax.call((error, result) => {
    if (error) throw error;

    if (result) {
      self.defaults.set('min_amount', Math.floor(result.amount_min));
      self.defaults.set('max_amount', Math.ceil(result.amount_max));
      self.defaults.set('min_start_date', result.date_min);
      self.defaults.set('max_start_date', result.date_max);
      self.search.set('min_amount', Math.floor(result.amount_min));
      self.search.set('max_amount', Math.ceil(result.amount_max));
      self.search.set('min_date', result.date_min);
      self.search.set('max_date', result.date_max);
      self.ready.set(true);
    }
  });
  $(document).ready(function () {    
    $('nav').addClass("fixed-nav");
  });
});

// function catchEnter(event, template) {
//   const filters = template.filters.get();
//   const code = event.keyCode || event.which;
//   if (code === 13) {
//     const filterName = template.$('#contract-multi-search button')
//       .text()
//       .trim()
//       .toLowerCase();
//
//     if (filterName === 'filter') {
//       return true;
//     }
//
//     const filterString = event.target.value;
//     filters.push({
//       field: filterName.toLowerCase(),
//       string: filterString,
//     });
//     template.filters.set(uniqBy(filters, 'string'));
//     $(event.target).val('');
//   }
// }
function filterSupplier(event, template) {
  const filters = template.filters.get();
  const filterString = event.target.value;
  filters.push({
    field: "supply",
    string: filterString,
  });
  template.filters.set(uniqBy(filters, 'string'));
}

var filterElements = [
  {selector: "input.supplier_name_filter", field: "supplier" }
]

Template.Contracts.events({
  'click .search-submit': function(event,instance) {
    console.log("Filter");
    const filters = instance.filters.get();
    for  (var filter in filterElements) {
      filters.push({
        field: filterElements[filter].field,
        string: $(filterElements[filter].selector).val()
      });
    }
    console.log("filters",filters);
    instance.filters.set(uniqBy(filters, 'string'));
  }
  ,
  'click .dataTable div.js-title': function (event) {
   event.preventDefault();
   const dataTable = $(event.target).closest('.dataTable').DataTable();
   const rowData = dataTable.row(event.currentTarget).data();
   FlowRouter.go('/contracts/'+rowData._id+"#read");
  },
  // Displaying Only Part of a Collection's Data Set
  'change select#select_type_contracts_index'(event, instance) {
    instance.search.set('type', event.target.value);
  },
  // 'change input.supplier_name_filter'(event, template) {
  //   console.log("change input.supplier_name_filter",event.target.value);
  //   const filterString = event.target.value;
  // },


  // (event, instance) {
  //   instance.search.set('supplier', instance.search.get('supplier').push(event.target.value));
  // },
  'change input#from_date_contracts_index'(event, instance) {
    console.log("'change input#from_date_contracts_index'",event, instance);
    const dateMin = moment(event.target.value).add(18, 'hours').toDate();
    instance.search.set('min_date', dateMin);
  },
  'change input#to_date_contracts_index'(event, instance) {
    const dateMax = moment(event.target.value).add(18, 'hours').toDate();
    instance.search.set('max_date', dateMax);
  },
  'change input#min_amount_contracts_index'(event, instance) {
    const floor = Math.floor(parseFloat(event.target.value));
    instance.search.set('min_amount', floor);
  },
  'change input#max_amount_contracts_index'(event, instance) {
    const ceil = Math.ceil(parseFloat(event.target.value));
    instance.search.set('max_amount', ceil);
  },
  // 'click tbody .js-ocid' (event, instance) {
  //   event.preventDefault();
  //   const ocid = $(event.currentTarget)
  //     .text()
  //     .trim();
  //   FlowRouter.go(`/contracts/${ocid}#read`);
  // },
  // 'click tbody .js-dependency' (event, instance) {
  //   event.preventDefault();
  //   const dependency = $(event.currentTarget)
  //     .text()
  //     .trim();
  //   const simple = simpleName(dependency);
  //   FlowRouter.go(`/orgs/${simple}#read`);
  // },
  // 'keypress #contract-multi-search input, keydown #contract-multi-search input': debounce(catchEnter, 300),

  'click #contract-multi-search .dropdown-menu a': function(event, template) {
    event.preventDefault();
    const value = event.target.text;
    template.$('#contract-multi-search button').text(value);
    template.$('#contract-multi-search input').prop('disabled', false);
  },
  'click .js-remove-filter': function(event, template) {
    event.preventDefault();
    const value = template.$('.js-table-filter-controller select').val();
    const filters = template.filters.get();
    remove(filters, f => (f.string === value));
    template.filters.set(filters);
  },
});

function contractSearchApplyFilters(op, filters) {
  const query = op.$and;
  const grouped = groupBy(filters, 'field');

  filters.forEach((filter) => {
    const regex = grouped[filter.field].map(o => (o.string)).join('|');
    const o = {};
    if (filter.field === 'supplier') {
      o.$or = [
        {
          suppliers_org: {
            $regex: regex,
            $options: 'i',
          },
        },
        {
          suppliers_person: {
            $regex: regex,
            $options: 'i',
          },
        }
      ]
    } else {
      o[filter.field] = {
        $regex: regex,
        $options: 'i',
      };
    }
    query.push(o);
  });
  return { $and: query }

}

Template.Contracts.helpers({
  ready() {
    return Template.instance().ready.get();
  },

  selector() {
    const instance = Template.instance();
    const filters = instance.filters.get();
    console.log("Template.Contracts.helpers selector filters",filters);
    const ready = instance.ready.get();
    const search = instance.search;

    if (ready && isEmpty(filters)) {
      return contractSearchOperator(null, search);
    }

    if (ready) {
      const op = contractSearchOperator(null, search);
      return contractSearchApplyFilters(op, filters);
    }

    return {};
  },

  min_amount_search() {
    const instance = Template.instance();
    const amount = instance.search.get('min_amount');
    return numbro(amount).format('0,0.00');
  },

  min_amount() {
    const instance = Template.instance();
    return instance.defaults.get('min_amount');
  },

  max_amount_search() {
    const instance = Template.instance();
    const amount = instance.search.get('max_amount');
    return numbro(amount).format('0,0.00');
  },

  max_amount() {
    const instance = Template.instance();
    return instance.defaults.get('max_amount');
  },

  filters() {
    const instance = Template.instance();
    return instance.filters.get();
  },
});

Template.Contracts.onRendered(function () {
  const self = this;
  self.autorun((computation) => {
    if (!self.ready.get()) {
      return;
    }

    computation.stop();
    const minDate = Template.instance().defaults.get('min_start_date');
    const maxDate = Template.instance().defaults.get('max_start_date');

    const minPicker = new Pikaday({
      field: $('#from_date_contracts_index')[0],
      defaultDate: minDate,
      setDefaultDate: true,
    });

    const maxPicker = new Pikaday({
      field: $('#to_date_contracts_index')[0],
      defaultDate: maxDate,
      setDefaultDate: true,
    });

    $('input[type="range"]').rangeslider({ polyfill: false });
  });

  // return moment(d).format('ll');

});

Template.contract_dates.helpers({
  format_date: function(val) {
    if (val instanceof Date) {
      return moment(val).format('ll');
    }
    return 'N/A';
  }
});
Template.contract_amount.helpers({
  format_amount: function(value) {
    if (value) {
      return value.toLocaleString('en-UK',
        {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 2,
        });
    }
    return 'Importe desconocido';
  }
})

Template.contract_amount.helpers({
  format_currency: function(value) {
    if (value == "MXN") {
      return "Pesos mexicanos"
    }
    else if (value == "USD") {
      return "Dólares estadounidense"
    }
    return value;
  }
})
