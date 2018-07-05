import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import i18n from 'meteor/universe:i18n';
import { Notifications } from 'meteor/gfk:notifications';
import { DocHead } from 'meteor/kadira:dochead';
import { Orgs } from '../../../api/organizations/organizations.js';
import { simpleName } from '../../../api/lib';
import '../../../api/organizations/relations.js';
import '../../helpers.js';
import '../../components/memberships/memberships.js';
import '../../components/visualizations/viz.js';
import '../../components/similar/similar.js';
import '../../components/history/history.js';
import '../../components/contracts/contracts.js';
import '../../components/detail/detail.js';
import '../../components/image/image.js';
import { prepareSubArray } from '../../components/visualizations/relations.js';
import { isEmpty } from 'lodash';
import './orgs.html';
import nvd3 from 'nvd3';
import d3 from 'd3';
import d3plus from './d3plus.full.js';

const LIMIT = 1000;

orgCompetitorsSub = new SubsManager({
  cacheLimit: 50
});

Template.showOrgWrapper.onCreated(function() {
  const self = this;

  self.org = new ReactiveVar(false)
  self.ready = new ReactiveVar(false);
  self.autorun(() => {
    const id = FlowRouter.getParam('_id');
    const handle = self.subscribe('org', id, {
      onReady() {
        const org = Orgs.findOne({
          $or: [
            {
              _id: id,
            }, {
              simple: id,
            }, {
              name: id,
            }, {
              names: id,
            },
          ],
        });
        Session.set("currentDocumentId", org._id);
        org.collection = 'orgs';
        self.org.set(org);
      },
    });
    self.ready.set(handle.ready());
  });
});

Template.showOrgWrapper.helpers({

  ready() {
    return Template.instance().ready.get();
  },

  selectedOrganizationDoc() {
    return Template.instance().org.get();
  }

})

AutoForm.hooks({
  updateOrgForm: {
    after: {
      'method-update': function(error, result) {
        if (error){
          Notifications.error('Error', error.message);
        }
        if (result){
          Notifications.success(i18n.__("success"), i18n.__("organization successfully updated"));
        }
      },
      'method': function(error, result) {
        if (error){
          Notifications.error('Error', error.message);
        }
        if (result){
          Notifications.success(i18n.__("success"), i18n.__("organization successfully created"));
        }
      }
    }
  }
});

Template.orgView.helpers({
  isWebsite: function(value) {
    if (value === 'website') {
      return true
    } else {
      return false
    }
  },
  isEmpty(array) {
    return isEmpty(array)
  },
  simpleName(string) {
    return simpleName(string);
  },

})

Template.orgView.onRendered(function() {
  DocHead.setTitle('QuiénEsQuién.Wiki - ' + Template.instance().data.document.names[0]);
  this.$(function () {
    $('[data-toggle="tooltip"]').tooltip()
  });

//Evolución de contratos chart
    nv.addGraph(function() {
    var chart = nv.models.linePlusBarChart()
      .margin({top: 30, right: 60, bottom: 50, left: 70})
      .x(function(d, i) { return i })
      .y(function(d) { return d[1] })
      .color(d3.scale.category20().range().slice(1))
      .focusEnable(false)
      ;

    var data = [{
        "key" : "Importe",
        // "color": "#71a7f2",
        "bar": true,
        "values" : [ [ NaN , NaN], [ 1136005200000 , 11084] , [ 1138683600000 , 830531.56] , [ 1141102800000 , 1800000] , [ 1143781200000 , 6000] , [ 1146369600000 , 43000] , [ 1149048000000 , 850000] , [ 1151640000000 , 43600] , [ 1154318400000 , 141798.40] , [ 1149048000000 , 27757.79] , [ 1151640000000 , 26346.30], [ NaN , NaN] ]
      },
      {
        "key" : "Cantidad",
        // "color": "#ff6e00",
        "values" : [ [ NaN , NaN], [ 1136005200000 , 10] , [ 1138683600000 , 30] , [ 1141102800000 , 2] , [ 1143781200000 , 21] , [ 1146369600000 , 3] , [ 1149048000000 , 01] , [ 1151640000000 , 3] , [ 1154318400000 , 0] , [ 1149048000000 , 2] , [ 1151640000000 , 20], [ NaN , NaN] ]
    }]
    ;

    chart.xAxis
      .showMaxMin(false)
      .tickFormat(function(d) {
        var dx = data[0].values[d] && data[0].values[d][0] || 0;
        return d3.time.format('%Y')(new Date(dx))
      });

    chart.y1Axis
  		.tickFormat(function(d) { return '$' + d3.format(',f')(d) });


    chart.y2Axis
     	.tickFormat(d3.format(',f'));

    chart.bars.forceY([0]);

  	chart.bars.forceX([0]);

    d3.select('#chart svg')
      .datum(data)
      .transition().duration(500)
      .call(chart)
      ;

    nv.utils.windowResize(chart.update);

    return chart;
  });

//Tipo de contratos chart
  nv.addGraph(function() {
    var piechart = nv.models.pieChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .color(d3.scale.category20().range().slice(1))
        .showLabels(true);

    var piedata =  [
            {
              "label": "Licitación",
              "value" : 21
            } ,
            {
              "label": "Adjudicación directa",
              "value" : 5
            } ,
            {
              "label": "Invitación a 3°",
              "value" : 1
            }
      ]

      d3.select("#piechart svg")
          .datum(piedata)
          .transition().duration(1200)
          .call(piechart);

    return piechart;
  });

//Treemap
  var data = [
    {parent: "Comercial", id: "Gerencia Metropolitana", value: 300000, year: 2010},
    {parent: "Comercial", id: "Gerencia", value: 650000, year: 2008},
    {parent: "Bancario", id: "Programa de Abasto Social Baja California",  value: 100000, year: 2014},
    {parent: "Bancario", id: "Subdirección de adquisiciones de Consumo Interno", value: 83053.56,  year: 2012}
  ];

  //var layerColors = d3plus.color.random(slice(1) )


    new d3plus.Treemap()
      .data(data)
      .select('#treemap')
      .groupBy(["parent", "id"])
      .tooltipConfig({
        body: function(d) {
          var table = "<table class='tooltip-table'>";
          table += "<tr><td class='title'>Año:</td><td class='data'>" + d.year + "</td></tr>";
          table += "<tr><td class='title'>Monto:</td><td class='data'>" + d.value + "</td></tr>";
          table += "</table>";
          return table;
        },
        footer: function(d) {
          return "<sub class='tooltip-footer'>Datos recolectados en 2012</sub>";
        },
        title: function(d) {
          var txt = d.id;
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();;
        }
      })
      .colorRandom("category20")
      //.color({
        //"scale": "category20"
        //"range": [ "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5" ],
        //"value": "growth"
      //})  
      .sum("value")
      .render();
 
})

Template.upsertOrganisationForm.helpers({
  orgsCollection: function() {
    return Orgs
  }
});

Template.competitors.helpers({
  ready: function() {
    return Template.instance().ready.get()
  },
  data: function(defined) {
    return prepareSubArray(Orgs, defined);
  },
  simpleName(string) {
    return simpleName(string);
  },
});

// Template.contract_amount.helpers({
//   format_currency: function(value) {
//     if (value == "MXN") {
//       return "Pesos mexicanos"
//     }
//     else if (value == "USD") {
//       return "Dólares estadounidense"
//     }
//     return value;
//   }
// })
