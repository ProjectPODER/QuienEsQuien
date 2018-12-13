import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import i18n from 'meteor/universe:i18n';
import { Notifications } from 'meteor/gfk:notifications';
import { DocHead } from 'meteor/kadira:dochead';
import { Orgs, OrgsContractSummary } from '../../../api/organizations/organizations.js';
// import { partyFlagsAverage } from '../../../api/contract_flags/methods.js';
import { simpleName } from '../../../api/lib';
import '../../../api/organizations/relations.js';
import '../../helpers.js';
import '../../components/memberships/memberships.js';
import '../../components/visualizations/viz.js';
import '../../components/similar/similar.js';
import '../../components/history/history.js';
import '../../components/detail/detail.js';
import '../../components/image/image.js';
import '../../components/subscribe/subscribe.js';
import { prepareSubArray } from '../../components/visualizations/relations.js';
import { isEmpty, uniqBy, slice, find, countBy, sortBy, reverse } from 'lodash';
import jquery from 'jquery'
import 'jquery-visible'
import './orgs.html';
import nvd3 from 'nvd3';
import d3plus from './d3plus.full.js';
import d4 from 'd4';

console.log("orgs",1);

const LIMIT = 1000;

orgCompetitorsSub = new SubsManager({
  cacheLimit: 50
});

Template.showOrgWrapper.onCreated(function() {
  console.log("orgs",2);
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
        if (org) {
          // console.log("org",org);

          self.org.set(org);
          org.collection = 'orgs';
          Session.set("currentDocumentId", org._id);
        }
        else {
          window.location = "/persons/"+id;
          return false;
        }
        if (org.ocds_contract_count > 0 ) {

          suscriptionName = org.isPublic() ? "contracts-by-buyer-ocds" : "contracts-by-supplier-ocds"
          self.subscribe(suscriptionName,id, {
            onReady() {
              Session.set("orgContracts", org.contractsSupplied().fetch());
            }
          });

          //Cargar datos de banderas sólo para dependencias y paraestatales
          if (org.isPublic()) {
            self.subscribe("party_flags",id, {
              onReady() {
                Session.set("orgFlags", org.flags().fetch());
                console.log("orgFlags",Session.get("orgFlags"))
              }
            });

            let party_flags_average = partyFlagsAverage(id);
            console.log(party_flags_average);
          }

        }


        // console.log("flags",org.flags());

      }
    })
    self.ready.set(handle.ready());
  })
});

Template.showOrgWrapper.helpers({

  ready() {
    console.log("orgs",3);

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
    return slice(Session.get("orgContracts"),0,3)
  },
  flags() {
    if (Session.get("orgFlags") && Session.get("orgFlags")[0]) {
      return Session.get("orgFlags")[0].criteria_score;
    }
  },
  showLoadingFlags() {
    var org = Template.instance().data.document;

    console.log("showLoadingFlags",Session.get("orgFlags"), org.isPublic(), org.ocds_contract_count)
    if (!Session.get("orgFlags") && org.isPublic() && org.ocds_contract_count > 0) {
      return true;
    }
  },
  recomendations() {
    if (Session.get("orgFlags") && Session.get("orgFlags")[0]) {
      flags = Session.get("orgFlags")[0].criteria_score;
      delete flags.total_score;
      let flagsArray = [], recommendations = [];
      for (f in flags) {
        flagsArray.push({"flag": f, "value": (Number(flags[f])*100).toFixed(2)});
      }
      console.log(flagsArray);
      flagsArray = sortBy(flagsArray,"value").slice(0,3);
      for (f in flagsArray) {
        recommendations.push({"flag": flagsArray[f].flag, "text":
        "Las contrataciones de esta organización tienen un puntaje bajo en "+flagsArray[f].flag+" ("+flagsArray[f].value+"). Recomendamos mejorar las publicaciones y el proceso de contrataciones. Para más detalles lea la <a href='http://www.todosloscontratos.mx/metodologia'>metodología</a>."});
      }
      return recommendations;
    }
  },
  format_score(score) {
    return (Number(score)*100).toFixed(2);
  },
  dependencySummary() {
    var oc =Session.get("orgContracts");
    let summary = []

    for (c in oc) {
      let cc = oc[c];
      // console.log(cc);
      let partyName = cc.parties[0].memberOf.name;
      if (summary[partyName]) {
        summary[partyName]++;
      }
      else {
        summary[partyName] = 1;
      }
    }
    orderedSummary = Object.keys(summary).sort(function(a,b){return summary[a]-summary[b]})
    orderedSummary = slice(reverse(orderedSummary),0,5);
    console.log("ds",orderedSummary);
    return orderedSummary;
  },
  supplierSummary() {
    var oc =Session.get("orgContracts");
    let summary = []

    for (c in oc) {
      let cc = oc[c];
      // console.log(cc);
      let year = new Date(cc.contracts[0].period.startDate).getFullYear();
      let partyName = cc.parties[1].name;
      if (summary[partyName]) {
        summary[partyName]++;
      }
      else {
        summary[partyName] = 1;
      }
    }
    orderedSummary = Object.keys(summary).sort(function(a,b){return summary[a]-summary[b]})
    orderedSummary = slice(reverse(orderedSummary),0,5);
    console.log("ss",orderedSummary);
    return orderedSummary;
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


//Evolución de contratos chart
function evolucionDeContratos(summary) {
  console.log("Evolución de contratos chart")
  return nv.addGraph(function() {
    var chart = nv.models.linePlusBarChart()
    .margin({top: 50, right: 50, bottom: 30, left: 75})
    .x(function(d, i) { return i })
    .y(function(d) { return d[1] })
    .color(d3.scale.category20().range().slice(1))
    .showLabels(true)
    .showLegend(true)
    .focusEnable(false)
    ;

    // chart.bars.showValues(true);

    let importeValues = []
    let cantidadValues = []
    let lastYear;
    for (year in summary) {
      if (lastYear) {
        while(parseInt(year)>parseInt(lastYear)+1) {
          lastYear = parseInt(lastYear)+1;
          let lastUnixYear = new Date((lastYear+1).toString()).getTime();
          importeValues.push([new Date(lastUnixYear).getFullYear(),0])
          cantidadValues.push([new Date(lastUnixYear).getFullYear(),0])
        }
      }

      let unixYear = new Date((parseInt(year)+1).toString()).getTime();
      importeValues.push([new Date(unixYear).getFullYear(),summary[year].value])
      cantidadValues.push([new Date(unixYear).getFullYear(),summary[year].count])

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
    .showMaxMin(true)
    .tickFormat(function(d) {
      return data[0].values[d] && data[0].values[d][0] || d
    });

    chart.y1Axis
    .tickFormat(d3.format('$,f'));


    chart.y2Axis
    .tickFormat(d3.format(',f'));

    chart.bars.forceY([0,1000]);

    // chart.bars.forceX([0]);

    chart.lines.forceY([0,2]);

    d3.select('#chart svg')
    .datum(data)
    .transition().duration(500)
    .call(chart)
    ;

    nv.utils.windowResize(chart.update);

    return chart;
  });
}

//Evolución de contratos chart
function flagsGraph(summary) {
  console.log("Gráficos de banderas")
  return nv.addGraph(function() {
    var chart = nv.models.lineChart()
    .margin({top: 30, right: 15, bottom: 30, left: 30})
    .x(function(d, i) { return i })
    .y(function(d) { return d[1] })
    .color(d3.scale.category20().range().slice(1))
    // .showLabels(true)
    // .showLegend(true)
    .focusEnable(false)
    .useInteractiveGuideline(true)
    ;

    let puntajeValues = []

    for (year in summary[0].years) {
      let unixYear = new Date((parseInt(summary[0].years[year].year)+1).toString()).getTime();
      let yearDisplay = new Date(unixYear).getFullYear();
      let valueDisplay = (Number(summary[0].years[year].criteria_score.total_score)*100).toFixed(2);
      puntajeValues.push([yearDisplay,valueDisplay])
    }
    puntajeValues = reverse(puntajeValues);

    var data = [{
      "key": "Puntaje",
      values: puntajeValues
    }];
    console.log("calidad graph",data)

    chart.xAxis
    .showMaxMin(true)
    .tickFormat(function(d) {
      return data[0].values[d] && data[0].values[d][0] || d
    });

    chart.yAxis
    .tickFormat(d3.format(',f'));


    chart.lines.forceY([0,100]);

    d3.select('#flags-graph svg')
    .datum(data)
    .transition().duration(500)
    .call(chart)
    ;

    nv.utils.windowResize(chart.update);

    return chart;
  });
}

//Piechart
function tipoDeContratos(typeSummary) {
  console.log("Piechart")
  return nv.addGraph(function() {
    var piechart = nv.models.pieChart()
    .x(function(d) { return d.label })
    .y(function(d) { return d.value })
    .color(d3.scale.category20().range().slice(1))
    .showLabels(true);

    var piedata = [];
    for (type in typeSummary) {
      piedata.push({
        "label": type+" ",
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
}

//Treemap
function presupuestoPorRamo(ramoSummary) {
  console.log("Treemap",1)
  var data = []
  for (ramo in ramoSummary) {
    for (dependency in ramoSummary[ramo]) {
      // if (ramoSummary[ramo].length == 1) {
      //   dependency = ramo + " - " + dependency
      // }
      data.push({
        parent: ramo,
        id: dependency,
        value: Math.round(ramoSummary[ramo][dependency]),
      })
    }
    // console.log(dependency);
    // console.log(data);
  }

  // console.log("Treemap",2)
  // console.log("data",data);
  let treemap = new d3plus.Treemap()
  .data(data)
  .select('#treemap')
  .groupBy(["parent", "id"])
  .tooltipConfig({
    body: function(d) {
      var table = "<table class='tooltip-table'>";
      table += "<tr><td class='title'>Monto:</td><td class='data'>" + d.value + "</td></tr>";
      table += "</table>";
      return table;
    },
  })
  .sum("value");

  // console.log("Treemap",3)
  treemap.render();
  nv.utils.windowResize(treemap.render());
  return treemap;
}

//Force-directed Graph
function flujosProveedores(relationSummary) {

  console.log("Force-directed Graph",1)

  var chartDiv = document.getElementById("graph-container");
  // $(chartDiv).height(500);
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

  // console.log("Force-directed Graph",2)

  var svg = d4.select("#graph-container")
    .append('svg')
    .attr('width', width)
    .attr('height', height);
    // .call(zoom);

  var chart = svg.append("g")
    .attr("class", "nodesChart");

  var radius = d4.scaleSqrt()
    .range(radiusRange);

  var color = d4.scaleOrdinal(d4.schemeCategory20); //d4.scale.category20().range().slice(1)

  // Nodos dependencia: org, unidadesCompradoras, contratos, proveedores
  // Nodos empresa: org, contratos, department, dependency
  // links: org-contrato, contrato-department, department-dependency

  data = relationSummary;

  var dOver = [];

  nodes = data.nodes;
  links = data.links;

  var simulation = d4.forceSimulation(nodes)
    .force("charge", d4.forceManyBody().strength(10).distanceMax(180))
    .force("center", d4.forceCenter(centerCoor[0], centerCoor[1]))
    .force("link", d4.forceLink().id(function(d) { return d.id; }).distance(linkDistance).strength(3))
    // .force("x", d4.forceX().x(centerCoor[0]).strength(0.9))
    // .force("y", d4.forceY().y(centerCoor[1]).strength(0.9))
    // .alphaTarget(0.02)
    .force("collide", d4.forceCollide(function (d) { return d.weight+15; })
    .strength(0.7))
    // .force("radial", d4.forceRadial(200,centerCoor[0],centerCoor[1]))
    .on("tick", ticked);

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

    // d4.selectAll(".node").selectAll("text").remove();

    //TODO: Agregar texto para nodos con mucho weight
    nodeLabel = d4.select("#node0").append("text")
      .html(function(d) {
        return d.label;
      })
      .attr('text-anchor', 'middle')
      .style('font-size', '1rem')//12
      .attr('dy', '.35em')
      .attr('pointer-events', 'none')
      .attr('class', 'bubble-label');

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
        op = 0.8;
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
    simulation.alpha(0.05);
    chart.simulation = simulation;
  }

  function ticked() {
    node
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });

    nodeLabel
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; });

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
  return chart;
}


function addLink (relationSummary,link) {
  if (relationSummary.links.length > 1000) return false;

  var source = _.findWhere(relationSummary.nodes,{"label": link.source});
  var target = _.findWhere(relationSummary.nodes,{"label": link.target});

  if (source&&target) {

    // console.log("addLink",link,sourceId,target.id);
    if (!source.fixedWeight){
      source.weight = source.weight + 0.5;
    }
    if (!_.findWhere(relationSummary.links,{source: source.id,target: target.id})) {
      // console.log("addLink",link);
      relationSummary.links.push({id:relationSummary.links.length,source:source.id,target:target.id})
    }
  }
  else {
    console.error("Faltó agregar algún nodo",link);
  }
}
function addNode(relationSummary,node) {
  if (relationSummary.nodes.length > 400) return false;

  if (!_.findWhere(relationSummary.nodes,{label: node.label})) {
    // console.log("addNode",node);
    node.id = relationSummary.nodes.length;
    relationSummary.nodes.push(node);
  }
  return true;
}

function maxContractAmount(contracts) {
  return contracts[0].contracts[0].value.amount;
}

function drawGraphs(drawn,org) {
  var oc = Session.get("orgContracts");
  console.log("drawGraphs",drawn);
  drawn[0] = true;

  if (oc && oc.length > 0) {
    console.log("orgContracts",oc,drawn);

    //Esto es para que corra una sola vez

    var orgName = org.name;

    //Generar los objetos para cada gráfico
    let summary = {}
    let typeSummary = {}
    let ramoSummary = {}
    let relationSummary = {nodes: [], links: []}

    let nodeNumber = 1;
    let linkNumber = 1;

    //organización 1
    addNode(relationSummary,{"label":orgName,"weight":50,"color":"#b22200","cluster":1},nodeNumber);

    for (c in oc) {
      let cc = oc[c];
      let year = new Date(cc.contracts[0].period.startDate).getFullYear();
      if (!summary[year]) {
        summary[year] = {value: 0, count: 0}
      }
      //TODO: sumar los amounts en MXN siempre

      summary[year].value += cc.contracts[0].value.amount;
      summary[year].count += 1;

      if (!typeSummary[cc.tender.procurementMethodMxCnet]) {
        typeSummary[cc.tender.procurementMethodMxCnet] = 0;
      }
      typeSummary[cc.tender.procurementMethodMxCnet]++;

      var buyer = cc.parties[0];
      var ramo = buyer.id.toString().substr(0,3);
      if (!ramoSummary[ramo]) {
        ramoSummary[ramo] = {};
      }
      if (!ramoSummary[ramo][buyer.memberOf.name]) {
        ramoSummary[ramo][buyer.memberOf.name] = 0;
      }
      //TODO: sumar los amounts en MXN siempre
      ramoSummary[ramo][buyer.memberOf.name] += cc.contracts[0].value.amount;

      // Nodos dependencia: org, unidadesCompradoras, contratos, proveedores
      // Nodos empresa: org, contratos, department, dependency
      // links: org-contrato, contrato-department, department-dependency

      //adjudicación 2
      addNode(relationSummary,{"label":cc.tender.procurementMethodMxCnet,"weight":10,"color":"#282ffb","cluster":1})
      addLink(relationSummary,{source:orgName,target:cc.tender.procurementMethodMxCnet});
      //contratos 3
      addNode(relationSummary,{"label":cc.contracts[0].title,"weight":(cc.contracts[0].value.amount/maxContractAmount(oc))*25,fixedWeight: true, "color":"#282f6bcc","cluster":2})
      addLink(relationSummary,{source:cc.tender.procurementMethodMxCnet,target:cc.contracts[0].title});
      //departamento 4
      addNode(relationSummary,{"label":cc.buyer.name,"weight":10,"color":"#aec7e8","cluster":3})
      addLink(relationSummary,{source:cc.contracts[0].title,target:cc.buyer.name});

      if (org.isPublic()) {
        // proveedor 5
        let added = addNode(relationSummary,{"label":cc.parties[1].name,"weight":15,"color":"#ff7f0e","cluster":4})
        if (added) {
          addLink(relationSummary,{source:cc.parties[1].name,target:cc.buyer.name});
        }

      }
      else {
        // dependencia 5
        // console.log(1,cc.parties[0].memberOf.name);
        let added = addNode(relationSummary,{"label":cc.parties[0].memberOf.name,"weight":15,"color":"#ff7f0e","cluster":4})
        // console.log(2,added,cc.buyer.name);
        if (added == true) {
          addLink(relationSummary,{source:cc.parties[0].memberOf.name,target:cc.buyer.name});
          // console.log(3);
        }
        else {
          // console.log("4")
        }
      }

    }
    // console.log("relationSummary",relationSummary);

    evolucionDeContratos(summary);
    Meteor.setTimeout(function() {
      tipoDeContratos(typeSummary);
    }, 20);
    Meteor.setTimeout(function() {
      presupuestoPorRamo(ramoSummary);
    }, 30);

    Meteor.setTimeout(function() {
      chart = flujosProveedores(relationSummary);
      // console.log(chart);
    }, 40);

  }
  return drawn;
}


Template.orgView.onRendered(function() {

  var org = Template.instance().data.document;

  DocHead.setTitle('QuiénEsQuién.Wiki - ' + org.name);
  this.$(function () {
    $('[data-toggle="tooltip"]').tooltip()
  });

  //Esto es para que corra una sola vez
  let firstRun = true;

  this.autorun(() => {

    var flags = Session.get("orgFlags");

    if (flags && flags[0].years.length > 0 && firstRun == true) {
      console.log("flags",firstRun);

      //Esto es para que corra una sola vez
      firstRun = false;

      flagsGraph(flags);
    }
  });

  //Esto es para que corra una sola vez
  let drawn = [false,false,false];

  //Esto corre cada vez que se actualiza la variable de sesión de los contratos
  this.autorun(() => {
    drawn = drawGraphs(drawn,org);
  })

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
