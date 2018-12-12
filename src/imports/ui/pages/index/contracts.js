import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
// import Pikaday from 'pikaday';
import rangeslider from 'rangeslider.js';
import moment from 'moment';
import 'moment/locale/es'
import numbro from 'numbro';
// import 'pikaday/css/pikaday.css';
import 'rangeslider.js/dist/rangeslider.css';
import {
  debounce,
  uniqBy,
  isEmpty,
  remove,
  groupBy,
  clone,
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
import '../../helpers.js';
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

  self.ready.set(true);

  //TODO: Este código parece que no se ejecutara
  //Creo que sirve para setear minimos y maximos en los controles
  contractIndexMinMax.call({},(error, result) => {
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
    generateFilters(null,self,window.queryParams);

  });
});

var filterElements = [
  {selector: "input.supplier_name_filter", field: "awards.0.suppliers.0.name", field_name: "Proveedor", mode:"filter" }
  ,{selector: "input.dependency_name_filter", field: "buyer.name", more_fields: ["parties.0.memberOf.name"], field_name: "Dependencia", mode:"filter" }
  ,{selector: "select#tipo-adquisicion", field: "tender.procurementMethodMxCnet", field_name: "Procedimiento", type: "string", mode:"filter" }
  ,{selector: "input#from_date_contracts_index", field: "min_date",field_name: "Fecha de inicio",type: "date", mode:"search" }
  ,{selector: "input#to_date_contracts_index", field: "max_date",field_name: "Fecha de fin",type: "date", mode:"search" }
  ,{selector: "input#fecha-desconocido", field: "unknown_date",field_name: "Fecha desconocida",hiddenIfTrue: true, type: "bool", mode:"search" }
  ,{selector: "input#importe-minimo", field: "min_amount",field_name: "Importe mínimo", type: "number", mode:"search" }
  ,{selector: "input#importe-maximo", field: "max_amount",field_name: "Importe máximo", type: "number", mode:"search" }
  ,{selector: "input#importe-desconocido", field: "unknown_amount",field_name: "Importe desconocido", hiddenIfTrue: true, type: "bool", mode:"search" }
];

Template.Contracts.events({
  'click .search-submit': generateFilters,
  'click .add-field-control': function(event, instance) {
    var controlGroup = $(event.target).parent().find(".multiple-controls-group");
    var fieldName = controlGroup.find(".multiple-control:last").attr("name");
    var newField = controlGroup.find(".multiple-control-container:last").clone();
    newField.find(".multiple-control")
        .attr("name",fieldName+"-clone")
        .val("");
    controlGroup.append(newField);
    controlGroup.find(".remove-field-control:not(:last)").show()

  },
  'click .remove-field-control': function(event, instance) {
    var fieldContainer = $(event.target).parent(".multiple-control-container");
    if (fieldContainer.is(":only-child")) {
      fieldContainer.find(".multiple-control").val("");
      fieldContainer.find(".remove-field-control").hide();
    }
    else {
      $(event.target).parent(".multiple-control-container").remove();
    }
  },
  'click .delete-blob-filter': function(event, instance) {
    let field = $(event.target).parent(".blob").data("field");
    console.log("delete blob filter",field)
    let selector = _.findWhere(filterElements,{field:field}).selector;
    $(selector).val("")
    generateFilters(event,instance);
  },
  'click .importe-bucket': function(event, instance) {
    let item = $(event.target).parent(".importe-bucket");
    var bucket;

    // Si ya estaba seleccionado, borrar
    if (item.hasClass("selected")) {
      $(".importe-bucket").removeClass("selected");
      bucket = ["",""]
    }
    else {
      bucket = item.data("bucket").split("-");
      $(".importe-bucket").removeClass("selected");
      item.addClass("selected");
    }
    $("#importe-minimo").val(bucket[0]);
    $("#importe-maximo").val(bucket[1]);

  },
  'change #search-order': function (event,instance) {
    sort_order($(event.target).val(),instance);
  }
});


function sort_order(order,instance) {
  console.log("change #search-order",order,instance);
  let column;
  let direction = "desc";
  switch (order) {
    case "precio":
      $("#search-order").val("precio");
      column = 1;
      break;
    case "puntaje":
      $("#search-order").val("puntaje");
      column = 7;
      break;
  }
  $("#contract-index").DataTable().order([[column,direction],[1,"desc"]]).draw();
}

function generateFilters(event,instance,values) {
  const filters = [];
  // console.log("generateFilters",event,instance,values);
  for  (var filter in filterElements) {
    $(filterElements[filter].selector).each(function(index,filterElement) {

      var value = $(filterElement).val();
      //Permitir setear valores por URL
      if (values) {
        // console.log(filterElements[filter].field,values["filter_"+filterElements[filter].field])
        if (values["filter_"+filterElements[filter].field]) {
          if (!isEmpty(values["filter_"+filterElements[filter].field])) {
            value = values["filter_"+filterElements[filter].field].replace(/['"]+/g, '');
            if (!isEmpty(value)) {
              $(filterElement).val(value);
            }
          }
        }
      }
      if (!isEmpty(value)) {
        if (filterElements[filter].mode == "filter") {
          filters.push({
            field: filterElements[filter].field,
            string: value,
            hidden: filterElements[filter].hidden
          });
          if (filterElements[filter].more_fields) {
            for (f in filterElements[filter].more_fields) {
              filters.push({
                field: filterElements[filter].more_fields[f],
                string: value,
                hidden: filterElements[filter].hidden
              });

            }
          }
        } else if (filterElements[filter].mode == "search") {
          switch (filterElements[filter].type) {
            case "date":
              value = moment(value).toDate();
              break;
            case "bool":
              value = $(filterElement).is(":checked");
              break;
            case "number":
              value = Number(value)
              break;
            default:
              value

          }
        }

        if (filterElements[filter].mode == "search") {
          // console.log("search",filterElements[filter].field, value);
          instance.search.set(filterElements[filter].field, value);
        }
      }
      else {
        if (filterElements[filter].mode == "search") {
          instance.search.set(filterElements[filter].field, null);
        }
      }
    })
  }
  // console.log("filters",filters);
  instance.filters.set(filters);
}

function contractSearchApplyFilters(op, filters) {
  const query = op.$and || [];
  const grouped = groupBy(filters, 'field');

  filters.forEach((filter) => {
    const regex = grouped[filter.field].map(o => (o.string)).join('|');
    const o = {};
    o[filter.field] = {
      $regex: regex,
      $options: 'i',
    };
    query.push(o);
  });
  // console.log("query",query);
  return { $and: query }

}

Template.Contracts.helpers({
  ready() {
    return Template.instance().ready.get();
  },

  selector() {
    const instance = Template.instance();
    const filters = instance.filters.get();
    const ready = instance.ready.get();
    const search = instance.search;

    console.log("Template.Contracts.helpers selector filters",filters,"search",search);

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
    const search = instance.search;
    const filters = instance.filters.get();
    // console.log(instance,search,filters);

    var filtersInView = [];

    if (filters) {
      for (f in filters) {
        let filterDef = _.findWhere(filterElements,{field:filters[f].field});
        if (filterDef) {
          filters[f].field_name = filterDef.field_name;
          filtersInView.push(filters[f]);
        }
      }
    }

    if (search) {
      for (s in search.keys) {
        let filterDef = _.findWhere(filterElements,{field:s});
        //Los filtros se agregan si están definidos y no son null
        if (!isEmpty(search.keys[s]) && search.keys[s]!="null") {
          // y si el hiddenIfTrue es true y valor no es true o el hiddenIfTrue no está definido
          if (filterDef.hiddenIfTrue == true && search.keys[s] != "true" || !filterDef.hiddenIfTrue) {
            let value = search.keys[s].replace("true", "si").replace("false", "no");
            if (s == "min_date" || s == "max_date") {
              unixtime = value.substr(9,value.length-10);
              value = new Date(Number(unixtime)).toLocaleDateString();
            }
            // var hidden = searchElements.findIndex({"field":s}).hidden;
            filtersInView.push({"field": s, "field_name": filterDef.field_name, "string": value}); // , "hidden": hidden
          }
        }
      }
    }

    // console.log("filtersInView",filtersInView);

    return filtersInView;
  },
});

Template.Contracts.onRendered(function () {
  const self = this;
  self.autorun((computation) => {
    if (!self.ready.get()) {
      return;
    }

    computation.stop();
  });

  $('[data-toggle="tooltip"]').tooltip({placement: 'top'});

  //Default order
  if (window.queryParams) {
    if (window.queryParams.sort) {
      if (window.queryParams.sort.replace(/['"]+/g,"")=="score") {
        sort_order("puntaje",this);
      }
    }
  }

});

Template.contract_dates.helpers({
  format_date: function(val) {
    if (val instanceof Date) {
      return moment(val).locale('es').format('LL');
    }
    return 'N/A';
  }
});

Template.score_cell.helpers({
  format_score(score) {
    return (Number(score)*100).toFixed(2);
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
  },
  format_currency: function(value) {
    if (value == "MXN") {
      return "Pesos mexicanos"
    }
    else if (value == "USD") {
      return "Dólares estadounidenses"
    }
    else if (value == "EUR") {
      return "Euros"
    }
    return value;
  }
})
