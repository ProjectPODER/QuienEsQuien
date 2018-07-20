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
import '../../components/subscribe/subscribe.js';
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
  contracts() {
    return Session.get("orgContracts")
  },
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
  dependencySummary() {
    var oc =Session.get("orgContracts");
    let summary = []

    for (c in oc) {
      let cc = oc[c];
      console.log(cc);
      let year = cc.start_date.getFullYear();
      summary.push({name: cc.dependency})
    }
    console.log("ds",summary);
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
    // console.log(oc);
    if (oc) {

      let summary = {}
      let typeSummary = {}
      let ramoSummary = {}
      let relationSummary = {nodes: [], links: []}

      let nodeNumber = 1;
      let linkNumber = 1;
      relationSummary.nodes.push({"id":nodeNumber,"label":Template.instance().data.document.names[0],"weight":32.88,"color":"#b22200","cluster":1});

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

        // Nodos dependencia: org, unidadesCompradoras, contratos, proveedores
        // Nodos empresa: org, contratos, department, dependency
        // links: org-contrato, contrato-department, department-dependency

        nodeNumber++;
        relationSummary.nodes.push({"id":nodeNumber,"label":cc.title,"weight":10,"color":"#282f6b","cluster":2})

        let contractLink = {"id":linkNumber,"source":1,"target":nodeNumber}
        relationSummary.links.push(contractLink);

        nodeNumber++;
        relationSummary.nodes.push ({"id":nodeNumber,"label":cc.department,"weight":12,"color":"#aec7e8","cluster":3})

        linkNumber++;
        let departmentLink = {"id":linkNumber,"source":contractLink.target,"target":nodeNumber}
        relationSummary.links.push(departmentLink);

        nodeNumber++;
        relationSummary.nodes.push({"id":nodeNumber,"label":cc.dependency,"weight":15,"color":"#ff7f0e","cluster":4})

        linkNumber++;
        let dependencyLink = {"id":linkNumber,"source":departmentLink.target,"target":nodeNumber}
        relationSummary.links.push(dependencyLink);

      }
      // console.log(summary,typeSummary,ramoSummary);


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

        nv.utils.windowResize(piechart.update);

        return piechart;
      });

      //Treemap
      var data = []
      for (ramo in ramoSummary) {
        for (dependency in ramoSummary[ramo]) {
          data.push({
            parent: ramo,
            id: dependency,
            value: ramoSummary[ramo][dependency],
            year: 2010
          })
        }
      }

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


      //Force-directed Graph

      var chartDiv = document.getElementById("graph-container");
      $(chartDiv).height(500);
      var width = chartDiv.clientWidth;
      var height = chartDiv.clientHeight;
      var slide;
      var vWidth = $(window).width();

      var centerCoor = [], radiusRange = [], linkDistance, nodeDistance;

      if(vWidth <= 767) {
        centerCoor = [width * 0.5, height * 0.5];
        radiusRange = [3,25];
        linkDistance = 10;
        nodeDistance = 7;
      } else if(vWidth >= 768 && vWidth <= 1007) {
        centerCoor = [width * 0.5, height * 0.5];
        radiusRange = [4,50];
        linkDistance = 20;
        nodeDistance = 14;
      } else if(vWidth >= 1008 && vWidth <= 1199) {
        centerCoor = [width * 0.5, height * 0.5];
        radiusRange = [4,50];
        linkDistance = 20;
        nodeDistance = 14;
      } else if(vWidth >= 1200 && vWidth <= 1439) {
        centerCoor = [width * 0.5, height * 0.5];
        radiusRange = [4,50];
        linkDistance = 20;
        nodeDistance = 14;
      } else if(vWidth >= 1440) {
        centerCoor = [width * 0.5, height * 0.5];
        radiusRange = [4,50];
        linkDistance = 20;
        nodeDistance = 14;
      }

      function findNode(value) {
        for(var i = 0; i < nodes.length; i += 1) {
          if(nodes[i]["id"] === value) {
            return i;
          }
        }
        return -1;
      }

      function findLink(value) {
        for(var i = 0; i < links.length; i += 1) {
          if(links[i]["id"] === value) {
            return i;
          }
        }
        return -1;
      }

      function blend_colors(color1, color2, percentage) {
        color1 = color1 || '#000000';
        color2 = color2 || '#ffffff';
        percentage = percentage || 0.5;

        if (color1.length != 4 && color1.length != 7)
          throw new error('colors must be provided as hexes');

        if (color2.length != 4 && color2.length != 7)
          throw new error('colors must be provided as hexes');

        if (percentage > 1 || percentage < 0)
          throw new error('percentage must be between 0 and 1');

        if (color1.length == 4)
          color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3];
        else
          color1 = color1.substring(1);
        if (color2.length == 4)
          color2 = color2[1] + color2[1] + color2[2] + color2[2] + color2[3] + color2[3];
        else
          color2 = color2.substring(1);

        color1 = [parseInt(color1[0] + color1[1], 16), parseInt(color1[2] + color1[3], 16), parseInt(color1[4] + color1[5], 16)];
        color2 = [parseInt(color2[0] + color2[1], 16), parseInt(color2[2] + color2[3], 16), parseInt(color2[4] + color2[5], 16)];

        var color3 = [
          (1 - percentage) * color1[0] + percentage * color2[0],
          (1 - percentage) * color1[1] + percentage * color2[1],
          (1 - percentage) * color1[2] + percentage * color2[2]
        ];

        color3 = '#' + int_to_hex(color3[0]) + int_to_hex(color3[1]) + int_to_hex(color3[2]);

        return color3;
      }

      function int_to_hex(num) {
        var hex = Math.round(num).toString(16);
        if (hex.length == 1)
          hex = '0' + hex;
        return hex;
      }

      function zoomed() {
        chart.attr("transform", d4.event.transform);
      }

      var zoom = d4.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

      var svg = d4.select("#graph-container")
        .append('svg')
        .attr('width', width)
        .attr('height', height);
        // .call(zoom);

      var chart = svg.append("g")
        .attr("class", "nodesChart");

      var radius = d4.scaleSqrt()
        .range(radiusRange);

      var color = d4.scaleOrdinal(d4.schemeCategory10);

      // Nodos dependencia: org, unidadesCompradoras, contratos, proveedores
      // Nodos empresa: org, contratos, department, dependency
      // links: org-contrato, contrato-department, department-dependency

      data = relationSummary;
      console.log(data);

      var dOver = [];

      nodes = data.nodes;
      links = data.links;

      var simulation = d4.forceSimulation(nodes)
        .force("charge", d4.forceManyBody().strength(-2000).distanceMax(200))
        .force("center", d4.forceCenter(centerCoor[0], centerCoor[1]))
        .force("link", d4.forceLink().id(function(d) { return d.id; }).distance(linkDistance).strength(2))
        // .force("x", d4.forceX().x(centerCoor[0]).strength(0.9))
        // .force("y", d4.forceY().y(centerCoor[1]).strength(0.9))
        // .alphaTarget(0.02)
        .force("collide", d4.forceCollide(function (d) { return Math.sqrt(d.weight) + nodeDistance; })
          .strength(0.5))
        .force("radial", d4.forceRadial(200,centerCoor[0],centerCoor[1]))
        .on("tick", ticked);
        window.simulation = simulation;
        window.d4 = d4;

      var link = chart.append("g")
        .attr("class", "links")
        .selectAll(".link");

      var node = chart.append("g")
        .attr("class", "nodes")
        .selectAll(".node");

      var nodeCircle, nodeLabel;

      function update() {

        radius.domain(d4.extent(nodes, function(d){
          return d.weight;
        })).nice();

        d4.selectAll(".btn").classed("active", false);

        // Apply the general update pattern to the nodes.
        node = node.data(nodes, function(d) { return d.id;});
        node.exit().remove();
        node = node.enter().append("g")
          .attr("id", function(d) { return "node" + d.id;})
          .attr("class", "node")
          .append("circle")
          // .style("fill", function(d) {
          //   var color = "";
          //   console.log(activeNodes.indexOf(d.id));
          //   if(activeNodes.indexOf(d.id) != -1) {
          //     color = d.color;
          //   } else {
          //     color = blend_colors(d.color, "#F3F3F3", 0.85);
          //   }
          //   console.log(color);
          //   return color;
          // })
          .attr("r", function(d){ return radius(d.weight); })
          .on("mouseover", function(d) {
            dOver = d;
            d4.select(this).style("cursor", "none");
            // tpActive = true;
            var nodeTooltip = d4.select("body")//svg
              .append("div")
              .attr('class', 'foreign-tooltip')
              // .attr('x', dOver.x - 80)
              // .attr('y', dOver.y + 20)

            var tp = nodeTooltip.append("div")
              .attr('class', 'node-tooltip')
              .html(function(d) {
                return '<p class="name">' + dOver.label + '</p>';
              });
          })
          .on("mousemove", function(d) {
            // console.log(d4.mouse(this)[0]);
            d4.select(".foreign-tooltip")
              .style("left", (d4.event.pageX - 80) + "px")
              .style("top", (d4.event.pageY + 10) + "px");
          })
          .on("mouseout", function(d) {
            // tpActive = false;
            dOver = [];
            d4.select(this).style("cursor", "default");
            d4.select(".foreign-tooltip")
              .remove();
          })
          .call(d4.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended))
          .merge(node);

        // Colorize active nodes
        d4.selectAll(".node").selectAll("circle")
          .style("fill", function(d) {
            var color = "";
            // console.log(activeNodes.indexOf(d.id));
            color = d.color;
            // if(activeNodes.indexOf(d.id) != -1) {
            // } else {
            //   color = blend_colors(d.color, "#F3F3F3", 0.90);
            // }
            // console.log(color);
            return color;
          })

        d4.selectAll(".node").selectAll("text").remove();

        // nodeLabel = d4.select("#node12").append("text")
        //   .html(function(d) {
        //     return d.label;
        //   })
        //   .attr('text-anchor', 'middle')
        //   .style('font-size', function(d) { return Math.min(2 * radius(d.weight), (2 * radius(d.weight)) / this.getComputedTextLength() * 12) + 'px'; })//12
        //   .attr('dy', '.35em')
        //   .attr('pointer-events', 'none')
        //   .attr('class', 'bubble-label');

        // Apply the general update pattern to the links.
        link = link.data(links);//, function(d) { return links[findWithAttr(links, "id", d.source)] + "-" + links[findWithAttr(links, "id", d.target)]; });
        link.exit().remove();
        link = link.enter().append("line")
          .attr("stroke", function(d) {
            // console.log(d);
            return "#999";
            //return blend_colors(nodes[findNode(d.source)].color, nodes[findNode(d.target)].color, 0.5);
          })
          .merge(link);

        d4.selectAll("line")
          .style("opacity", function(d) {
            var op;
            // console.log(activeNodes.indexOf(d.id));
            op = 0.9;
            // if(activeLinks.indexOf(d.id) != -1) {
            // } else {
            //   op = 0.4;
            // }
            // console.log(color);
            return op;
          })
          .attr("stroke-width", function(d) {
            var sw;
            // console.log(activeNodes.indexOf(d.id));
            sw = 2;
            // if(activeLinks.indexOf(d.id) != -1) {
            // } else {
            //   sw = 1;
            // }
            // console.log(color);
            return sw;
          })

        // Update and restart the simulation.
        simulation.nodes(nodes);
        simulation.force("link").links(links).id(function(d) { return d.id; });
        // simulation.force("link", d4.forceLink(links).id(function(d) { return d.id; }).distance(40));
        simulation.alpha(0.05).restart();
      }

      function ticked() {
        node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });

        // nodeLabel
        //   .attr("x", function(d) { return d.x; })
        //   .attr("y", function(d) { return d.y; });

        link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        // if(tpActive) {
        //   svg.select('.foreign-tooltip')
        //     .attr('x', dOver.x - 80)
        //     .attr('y', dOver.y + 20)
        // }
      }

      function dragstarted(d) {
        if (!d4.event.active) simulation.alphaTarget(0.05).restart();//0.08
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d4.event.x;
        d.fy = d4.event.y;
      }

      function dragended(d) {
        if (!d4.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }


      /******** User interactions ********/
      
      update();


    }
  })

});

/*Template.upsertOrganisationForm.helpers({
  orgsCollection: function() {
    return Orgs
  }
});*/

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
