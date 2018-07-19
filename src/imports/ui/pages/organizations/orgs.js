import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import i18n from 'meteor/universe:i18n';
import { Notifications } from 'meteor/gfk:notifications';
import { DocHead } from 'meteor/kadira:dochead';
import { Orgs, OrgsContractSummary } from '../../../api/organizations/organizations.js';
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
import jquery from 'jquery'
import './orgs.html';
import nvd3 from 'nvd3';
import d3plus from './d3plus.full.js';
import d4 from 'd4';
const LIMIT = 1000;

orgCompetitorsSub = new SubsManager({
  cacheLimit: 50
});

Template.showOrgWrapper.onCreated(function() {
  const self = this;

  self.org = new ReactiveVar(false)
  self.orgContractSummary = new ReactiveVar(false)

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
        self.subscribe("contracts-by-supplier",org.simple, {
          onReady() {
            Session.set("orgContracts", org.contractsSupplied().fetch());
          }
        });
        org.collection = 'orgs';
        self.org.set(org);
      }
    })
    self.ready.set(handle.ready());
  })
});

Template.showOrgWrapper.helpers({

  ready() {
    return Template.instance().ready.get();
  },

  selectedOrganizationDoc() {
    return Template.instance().org.get();
  },


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
  contractSummary() {
    var oc =Session.get("orgContracts");
    let summary = {}

    for (c in oc) {
      let cc = oc[c];
      console.log(cc);
      let year = cc.start_date.getFullYear();
      if (!summary[year]) {
        summary[year] = {value: 0, count: 0}
      }
      summary[year].value += cc.amount;
      summary[year].count += 1;
    }
    console.log("cs",summary);
    return summary;
  },
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

  this.autorun(() => {

    var oc = Session.get("orgContracts");
    console.log(oc);
    if (oc) {

      let summary = {}
      let typeSummary = {}
      let ramoSummary = {}

      for (c in oc) {
        let cc = oc[c];
        let year = cc.start_date.getFullYear();
        if (!summary[year]) {
          summary[year] = {value: 0, count: 0}
        }
        summary[year].value += cc.amount;
        summary[year].count += 1;

        if (!typeSummary[cc.procedure_type]) {
          typeSummary[cc.procedure_type] = 0;
        }
        typeSummary[cc.procedure_type]++;

        if (!ramoSummary[cc.clave_uc.substr(0,3)]) {
          ramoSummary[cc.clave_uc.substr(0,3)] = {};
        }
        if (!ramoSummary[cc.clave_uc.substr(0,3)][cc.dependency]) {
          ramoSummary[cc.clave_uc.substr(0,3)][cc.dependency] = 0;
        }
        ramoSummary[cc.clave_uc.substr(0,3)][cc.dependency] += cc.amount;
      }
      console.log(summary,typeSummary,ramoSummary);


      //Evolución de contratos chart
      nv.addGraph(function() {
        var chart = nv.models.linePlusBarChart()
        .margin({top: 30, right: 60, bottom: 50, left: 70})
        .x(function(d, i) { return i })
        .y(function(d) { return d[1] })
        .color(d3.scale.category20().range().slice(1))
        .focusEnable(false)
        ;


        let importeValues = []
        let cantidadValues = []
        let lastYear;
        for (year in summary) {
          if (lastYear) {
            while(parseInt(year)>parseInt(lastYear)+1) {
              lastYear = parseInt(lastYear)+1;
              let lastUnixYear = new Date((lastYear+1).toString()).getTime();
              importeValues.push([lastUnixYear,0])
              cantidadValues.push([lastUnixYear,0])
            }
          }

          let unixYear = new Date((parseInt(year)+1).toString()).getTime();
          importeValues.push([unixYear,summary[year].value])
          cantidadValues.push([unixYear,summary[year].count])

          lastYear = year;
        }


        var data = [{
          "key": "Importe",
          "bar": true,
          values: importeValues
        },{
          "key": "Cantidad",
          values: cantidadValues
        }];

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

      //Piechart
      nv.addGraph(function() {
        var piechart = nv.models.pieChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .color(d3.scale.category20().range().slice(1))
        .showLabels(true);

        var piedata = [];
        for (type in typeSummary) {
          piedata.push({
            "label": type,
            "value": typeSummary[type]
          })
        }

        d3.select("#piechart svg")
        .datum(piedata)
        .transition().duration(1200)
        .call(piechart);

        return piechart;
      });

      //Treemap
      var data = []
      for (ramo in ramoSummary) {
        for (dependency in ramoSummary[ramo]) {
          data.push({
            parent: ramo,
            id: dependency,
            value: ramoSummary[ramo][dependency]
          })
        }
      }

      var data2 = [
        {parent: "Comercial", id: "Gerencia Metropolitana", value: 300000, year: 2010},
        {parent: "Comercial", id: "Gerencia", value: 650000, year: 2008},
        {parent: "Bancario", id: "Programa de Abasto Social Baja California",  value: 100000, year: 2014},
        {parent: "Bancario", id: "Subdirección de adquisiciones de Consumo Interno", value: 83053.56,  year: 2012}
      ];

      console.log(data,data2);


      new d3plus.Treemap()
      .data(data)
      .select('#treemap')
      .groupBy(["parent", "id"])
      .tooltipConfig({
        body: function(d) {
          var table = "<table class='tooltip-table'>";
          // table += "<tr><td class='title'>Año:</td><td class='data'>" + d.year + "</td></tr>";
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
      .sum("value")
      .render();
    }
  })

});

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
