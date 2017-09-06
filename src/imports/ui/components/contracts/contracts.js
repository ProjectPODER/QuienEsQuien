import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import numbro from 'numbro';
import moment from 'moment';
import 'nvd3/build/nv.d3.css';
import 'pikaday/css/pikaday.css';
import 'rangeslider.js/dist/rangeslider.css';
import { compact } from 'lodash';
import {
  ReactiveDict,
} from 'meteor/reactive-dict';
import {
  basicContractInfo,
  contractsMinMax,
} from '../../../api/contracts/methods';
import {
  simpleName,
} from '../../../api/lib';
import {
  contractSearchOperator,
} from './lib';
import '../spin/spinner.html';
import './contracts.html';

Template.ContractsOfOrgWrapper.onCreated(function () {
  const self = this;
  const doc = self.data.document;
  const isPublic = (doc.collectionName() === 'organizations' && doc.isPublic());
  self.ready = new ReactiveVar(false);
  self.contractData = new ReactiveVar(false);
  self.autorun(() => {
    basicContractInfo.call({
      names: doc.names,
      isPublic,
    }, (error, result) => {
      if (error) throw error;
      self.ready.set(true);
      self.contractData.set(result);
    });
  });
});

Template.ContractsOfOrgWrapper.helpers({
  data() {
    return Template.instance()
      .contractData.get();
  },
  hasContracts() {
    return ( Template.instance()
      .data.document.contract_count );
  },
});

Template.ContractsInfoBasic.helpers({
  count() {
    const instance = Template.instance();
    const data = instance.data.contract_stats;
    const count = data.reduce((acc, cur) => (acc + cur.count), 0);
    return numbro(count).format('0,0')
  },
  totalValue() {
    const instance = Template.instance();
    const data = instance.data.contract_stats;
    const value = data.reduce((acc, cur) => (acc + cur.value), 0);
    return numbro(value).format('0,0.00');
  },
  periods() {
    const instance = Template.instance();
    const data = instance.data.contract_stats;
    return compact(data.map(o => (o.year)));
  },
});

Template.ContractsTable.onCreated(function () {
  const self = this;
  const doc = self.data.document;
  const isPublic = (doc.collectionName() === 'organizations' && doc.isPublic());

  self.search = new ReactiveDict();
  self.defaults = new ReactiveDict();
  self.defaults.set('min_amount', 0);
  self.defaults.set('max_amount', 85000000000);
  self.ready = new ReactiveVar(false);

  contractsMinMax.call({
    names: doc.names,
    isPublic,
  }, (error, result) => {
    if (error) throw error;

    self.defaults.set('min_amount', Math.floor(result.amount_min));
    self.defaults.set('max_amount', Math.ceil(result.amount_max));
    self.defaults.set('min_start_date', result.date_min);
    self.defaults.set('max_start_date', result.date_max);
    self.search.set('min_amount', Math.floor(result.amount_min));
    self.search.set('max_amount', Math.ceil(result.amount_max));
    self.search.set('min_start_date', result.date_min);
    self.search.set('max_start_date', result.date_max);
    self.ready.set(true);
  });

  self.search.set('type', 'all');
  self.search.set('supplier', '');
});

Template.ContractsTable.onRendered(function () {
  const self = this;
  self.autorun((computation) => {
    if (!self.ready.get()) {
      return;
    }

    computation.stop();
    const minDate = Template.instance().defaults.get('min_start_date');
    const maxDate = Template.instance().defaults.get('max_start_date');

    import('pikaday').then((m) => {
      const Pikaday = m.default;
      const minPicker = new Pikaday({
        field: $('#from_date')[0],
        defaultDate: minDate,
        setDefaultDate: true,
      });

      const maxPicker = new Pikaday({
        field: $('#to_date')[0],
        defaultDate: maxDate,
        setDefaultDate: true,
      });

      self.search.set('min_date', minDate);
      self.search.set('max_date', maxDate);
    });

    import('rangeslider.js').then((rangeslider) => {
      $('input[type="range"]').rangeslider({ polyfill: false });
    });

  });

  const table = $('#contract-detail-table').DataTable();

  $('#dependency_supplier_search')
    .on('keyup', function () {
      table.columns(7)
        .search(this.value)
        .draw();
    });
});

Template.ContractsTable.helpers({
  ready() {
    Template.instance().ready.get();
  },

  min_amount: function () {
    const instance = Template.instance();
    return instance.defaults.get('min_amount');
  },

  max_amount: function () {
    const instance = Template.instance();
    return instance.defaults.get('max_amount');
  },

  max_amount_search: function () {
    const instance = Template.instance();
    const amount = instance.search.get('max_amount');
    return numbro(amount).format('0,0.00');
  },

  min_amount_search: function () {
    const instance = Template.instance();
    const amount = instance.search.get('min_amount');
    return numbro(amount).format('0,0.00');
  },

  min_start_date: function () {
    const instance = Template.instance();
    return instance.defaults.get('min_start_date');
  },

  max_start_date: function () {
    const instance = Template.instance();
    return instance.defaults.get('max_start_date');
  },

  isPublic() {
    const instance = Template.instance();
    const doc = instance.data.document;
    return (doc.collectionName() === 'organizations' && doc.isPublic());
  },

  publicSelector() {
    const instance = Template.instance();
    const ready = instance.ready.get();
    const doc = instance.data.document;
    const baseQuery = {
      dependency: {
        $regex: doc.names.join('|'),
        $options: 'i',
      },
    };
    if (ready) {
      return contractSearchOperator(baseQuery, instance.search);
    }
    return baseQuery;
  },

  privateSelector() {
    const instance = Template.instance();
    const ready = instance.ready.get();
    const doc = instance.data.document;
    let baseQuery = { suppliers_org: doc.simple };
    if (doc.collectionName() === 'persons') {
      baseQuery = { suppliers_person: doc.simple };
    }
    if (ready) {
      return contractSearchOperator(baseQuery, instance.search);
    }
    return baseQuery;
  },
});

Template.ContractsTable.events({
  'click .dataTable tbody tr td.js-title': function (event) {
   event.preventDefault();
   const dataTable = $(event.target).closest('table').DataTable();
   const rowData = dataTable.row(event.currentTarget).data();
   FlowRouter.go('/contracts/'+rowData._id+"#read");
  },
  'change input#from_date' (event, instance) {
    const dateMin = moment(event.target.value).add(18, 'hours').toDate();
    instance.search.set('min_date', dateMin);
  },
  'change input#to_date' (event, instance) {
    const dateMax = moment(event.target.value).add(18, 'hours').toDate();
    instance.search.set('max_date', dateMax);
  },
  'change input#min_amount' (event, instance) {
    instance.search.set('min_amount', parseFloat(event.target.value));
  },
  'change input#max_amount' (event, instance) {
    instance.search.set('max_amount', parseFloat(event.target.value));
  },
  'change select#select_type' (event, instance) {
    instance.search.set('type', event.target.value);
  },
  'keyup input#supplier_search' (event, instance) {
    instance.search.set('supplier', event.target.value);
  },
  'click tbody .js-ocid' (event, instance) {
    event.preventDefault();
    const ocid = $(event.currentTarget)
      .text()
      .trim();
    FlowRouter.go(`/contracts/${ocid}#read`);
  },
  'click tbody .js-dependency' (event, instance) {
    event.preventDefault();
    const dependency = $(event.currentTarget)
      .text()
      .trim();
    const simple = simpleName(dependency);
    FlowRouter.go(`/orgs/${simple}#read`);
  },
})

Template.GraphPlaceholder.onRendered(function () {
  const self = this;
  const stats = self.data.contract_stats;

  const amountLine = stats.map(o => ({ x: o.year, y: o.value }));
  const countLine = stats.map(o => ({ x: o.year, y: o.count }));

  const years = stats.map(o => (o.year));

  const chartData = [
    {
      key: 'Monto',
      values: amountLine,
      area: true,
    },
    {
      key: 'Contratos',
      values: countLine,
    },
  ];

  Promise.all([import('d3'), import('nvd3')])
  .then((array) => {
    const nvd3 = array[1];
    nvd3.addGraph(() => {
      const chart = nvd3.models.lineChart()
        .margin({ left: 100 })
        .useInteractiveGuideline(true)
        .forceY([0])
        .showLegend(false);

      chart.xAxis.tickValues(compact(years));
      chart.yAxis.tickFormat(d => (numbro(d).format('0,0.00')));

      chart.interactiveLayer.tooltip.valueFormatter((d) => {
        if (/\./.test(d)) {
          return numbro(d).format('0,0.00');
        }
        return d;
      });

      d3.select('#contract_tab_chart')
        .datum(chartData)
        .transition()
        .duration(500)
        .attr('width', 200)
        .attr('height', 50)
        .call(chart);

      nvd3.utils.windowResize(chart.update);

      return chart;
    });
  });
});
