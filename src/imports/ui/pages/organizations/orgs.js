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

//Piechart
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

    nv.utils.windowResize(piechart.update);

    return piechart;
  });

//Treemap
  var data = [
    {parent: "Comercial", id: "Gerencia Metropolitana", value: 300000, year: 2010},
    {parent: "Comercial", id: "Gerencia", value: 650000, year: 2008},
    {parent: "Bancario", id: "Programa de Abasto Social Baja California",  value: 100000, year: 2014},
    {parent: "Bancario", id: "Subdirección de adquisiciones de Consumo Interno", value: 83053.56,  year: 2012}
  ];

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
      //.color({
        //"scale": "category20"
        //"range": [ "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5" ],
        //"range": ["#B22200", "#FFEE8D", "#759143" ],
        //"value": "growth"
      //})
      .sum("value")
      .render();


  //Force-directed Graph

    var chartDiv = document.getElementById("graph-container");
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
      centerCoor = [width * 0.7, height * 0.5];
      radiusRange = [4,50];
      linkDistance = 20;
      nodeDistance = 14;
    } else if(vWidth >= 1008 && vWidth <= 1199) {
      centerCoor = [width * 0.7, height * 0.5];
      radiusRange = [4,50];
      linkDistance = 20;
      nodeDistance = 14;
    } else if(vWidth >= 1200 && vWidth <= 1439) {
      centerCoor = [width * 0.7, height * 0.5];
      radiusRange = [4,50];
      linkDistance = 20;
      nodeDistance = 14;
    } else if(vWidth >= 1440) {
      centerCoor = [width * 0.7, height * 0.5];
      radiusRange = [4,50];
      linkDistance = 20;
      nodeDistance = 14;
    }

    var text1 = "BlackRock tiene intereses en las <strong style='background-color: #2A801B; color: #FFF; padding: 0 3px;'>industrias de energÃ­a</strong>, <strong style='background-color: #C722BF; color: #FFF; padding: 0 3px;'>bursÃ¡til</strong> y de <strong style='background-color: #146763; color: #FFF; padding: 0 3px;'>fondos de pensiÃ³n</strong>, los cuales instrumenta a travÃ©s de una compleja estructura corporativa.";
    var text2 = "A travÃ©s de mandatos de inversiÃ³n extranjera las Afores contratan a BlackRock para que esta invierta un porcentaje de los ahorros de los mexicanos en los mercados extranjeros.<br/><br/>En 2014 BlackRock y <strong style='background-color: #156F6B; color: #FFF; padding: 0 3px;'>Afore Banamex</strong> firmaron dos contratos por mandatos de inversiÃ³n extranjera; violando el lineamiento de la Consar que dicta que los Mandatarios no pueden estar siendo investigados en un PaÃ­s Elegible de Inversiones. En el momento de la firma y del visto bueno de Consar, BlackRock estaba siendo investigado en Italia.<br><br>La historia completa: <a href='https://www.connectas.org/especiales/blackrock-gigante-desconocido/con-investigacion-pendiente-blackrock-firmo-contratos-con-afore-banamex.html' target='_top'>El mandato de Afore Banamex con BlackRock obviÃ³ una demanda en Italia</a>";
    var text3 = "BlackRock tiene acciones de <strong style='background-color: #80187A; color: #FFF; padding: 0 3px;'>69 empresas listadas</strong> en la Bolsa Mexicana de Valores, por un valor de 43 mil millones de pesos. Estas acciones las coloca en sus instrumentos de inversiÃ³n Exchange Trade Funds (ETFs) o iShares.<br><br>La historia completa: <a href='https://www.connectas.org/especiales/blackrock-gigante-desconocido/el-principal-inversionista-de-la-bmv.html' target='_top'>El principal inversionista de la BMV</a><p class='note'>*El tamaÃ±o de los nodos que representan a las empresas estÃ¡ relacionado con el porcentaje de sus acciones pÃºblicas que tiene BlackRock en los ETFs.</p>";
    var text4 = "BlackRock tiene 0.69% de las acciones de <strong style='background-color: #46C9ED; color: #FFF; padding: 0 3px;'>Grupo Financiero Banorte (GFNORTE)</strong> en sus iShares, y tambiÃ©n tiene un contrato con <strong style='background-color: #46C9ED; color: #FFF; padding: 0 3px;'>Afore XXI-Banorte</strong>, la rama de pensiones del grupo financiero propiedad de Carlos Hank GonzÃ¡lez. A travÃ©s de ese acuerdo, la estadounidense funge como Mandatario, figura creada en 2011 por la ComisiÃ³n Nacional del Sistema de Ahorro para el Retiro (Consar) para que gigantes administradoras de fondos inviertan una proporciÃ³n del ahorro de los mexicanos en el extranjero.";
    var text5 = "Acciones de <strong style='background-color: #46C9ED; color: #FFF; padding: 0 3px;'>Grupo Financiero Inbursa (GFINBUR)</strong> tambiÃ©n estÃ¡n contenidas en los ETFs de BlackRock, pero esa no es la Ãºnica relaciÃ³n que guardan las empresas. <strong style='background-color: #46C9ED; color: #FFF; padding: 0 3px;'>Marco Antonio Slim Domit</strong>, presidente de Inbursa es tambiÃ©n consejero de BlackRock, Inc. De hecho la familia Slim ya antes ha estado interesada en BlackRock y viceversa. El magnate Carlos Slim, padre de Marco Antonio Slim Domit, comprÃ³ 2% de las acciones de BlackRock en 2010 y BlackRock reporta a AmÃ©rica MÃ³vil como una de sus inversiones directas vigentes en 2017.";
    var text6 = "BlacRock tiene de <strong style='background-color: #46C9ED; color: #FFF; padding: 0 3px;'>Infraestructura EnergÃ©tica NOVA (IENOVA)</strong> 0.50% de las acciones en sus ETFs, al mismo tiempo que es socia de esa empresa en <strong style='background-color: #46C9ED; color: #FFF; padding: 0 3px;'>Los Ramones</strong>, uno de los gasoductos mÃ¡s importantes del paÃ­s. En esa obra energÃ©tica, que desde 2013 hasta ahora ha pasado de manos de PEMEX a la iniciativa privada, BlackRock sostiene 45% de las acciones y IENOVA 50%.";
    var text7 = "Entre 2015 y 2017 BlackRock ha ganado control directo e indirecto sobre cinco <strong style='background-color: #2A801B; color: #FFF; padding: 0 3px;'>proyectos de infraestructura energÃ©tica</strong> entre ellos, <strong style='background-color: #2FC425; color: #FFF; padding: 0 3px;'>dos gasodutos de seguridad nacional</strong> y seis bloques de exploraciÃ³n petrolera. La empresa firmÃ³ un memorÃ¡ndum con PetrÃ³leos Mexicanos un mes despuÃ©s de una reuniÃ³n con Enrique PeÃ±a Nieto.<br><br>La historia completa: <a href='https://www.connectas.org/especiales/blackrock-gigante-desconocido/el-interes-energetico-de-blackrock.html' target='_top'>El control energÃ©tico de BlackRock</a>";
    var text8 = "BlackRock, Inc. replica en MÃ©xico su esquema corporativo complejo y opaco con <strong style='background-color: #C3C32F; color: #FFF; padding: 0 3px;''>seis subsidiarias</strong> dadas de alta en el paÃ­s. Tres son identificadas por Lexis Nexis Corporate Affiliations como empresas caparazÃ³n â€“ mÃ¡s conocidas como shell: sociedades sin operaciones de negocios ni activos significativos-. Las otras tres tienen de accionista mayoritaria a una compaÃ±Ã­a ubicada en los PaÃ­ses Bajos, conocido por el generoso tratamiento fiscal que da a multinacionales.<br><br>La historia completa: <a href='https://www.connectas.org/especiales/blackrock-gigante-desconocido/subsidiarias-en-paraisos-fiscales-como-blackrock-llego-a-mexico.html' target='_top'>Subsidiarias en paraÃ­sos fiscales, cÃ³mo BlackRock llegÃ³ a MÃ©xico</a>";
    var text9 = "En 2015 BlackRock creÃ³ tres subsidiarias con el Ãºnico objetivo de comprar a Infraestructura Institucional (I2), un fondo privado de inversiones energÃ©ticas fundado por JerÃ³nimo Gerard Rivero, cuÃ±ado del ex presidente Carlos Salinas de Gortari. Con la adquisiciÃ³n de este fondo, BlackRock se hizo de acciones de Sierra Oil & Gas, una empresa petrolera que ha sabido colocarse en la apertura energÃ©tica mexicana y ha ganado varias <strong style='background-color: #46C9ED; color: #FFF; padding: 0 3px;'>rondas de exploraciÃ³n de bloques petroleros</strong>. AdemÃ¡s, accediÃ³ a 7,392 millones de pesos que las Afores han invertido en el fondo de infraestructura de I2.";
    var text10 = "La estrategia de BlackRock es clara, la absorciÃ³n de activos mexicanos. A eso obedece la  Ãºltima compra que hizo de la gestora <strong style='background-color: #C3C32F; color: #FFF; padding: 0 3px;'>Impulsora de Fondos Banamex</strong>, de Citibanamex. Con esta transacciÃ³n adquiriÃ³ la administraciÃ³n de 31,000 millones de dÃ³lares en activos, depositados sobre todo en renta fija y renta variable. AdemÃ¡s, amplÃ­a su clientela a banca de consumo y compromete al banco a ofrecer los instrumentos de inversiÃ³n de BlackRock en sus sucursales.";


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

    var allNodes = {}, allLinks = {}, nodes = [], links = [], activeNodes = [], activeLinks = [];

    $.ajax({
      url: "json/data.json",
      dataType: "json",
      success: function(data) {
        // var tpActive = false;
        var dOver = [];

        // var clusters = new Array(5);
        allNodes = data.nodes;
        allLinks = data.links;

        nodes = [allNodes[12], allNodes[27], allNodes[62], allNodes[80], allNodes[87]];
        links = [allLinks[1],allLinks[2],allLinks[3],allLinks[4]];

        var simulation = d4.forceSimulation(nodes)
          .force("charge", d4.forceManyBody().strength(1000).distanceMax(20))
          .force("center", d4.forceCenter(centerCoor[0], centerCoor[1]))
          .force("link", d4.forceLink().id(function(d) { return d.id; }).distance(linkDistance).strength(2))
          // .force("x", d4.forceX())
          // .force("y", d4.forceY())
          // .alphaTarget(0.02)
          .force("collide", d4.forceCollide(function (d) { return Math.sqrt(d.weight) + nodeDistance; })
            .strength(0.5))
          .on("tick", ticked);


        var link = chart.append("g")
          .attr("class", "links")
          .selectAll(".link");

        var node = chart.append("g")
          .attr("class", "nodes")
          .selectAll(".node");

        var nodeCircle, nodeLabel;

        slide = 1;
        update([12,27,62,80,87],[1,2,3,4]);

        function update(activeNodes, activeLinks) {
          // console.log(slide);
          radius.domain(d4.extent(nodes, function(d){
            return d.weight;
          })).nice();

          d4.selectAll(".btn").classed("active", false);
          d4.select("#btn" + slide).classed("active", true);
          d4.select("#text").html(this["text" + slide]);

          if(slide == 1) {
            $(".fas.fa-chevron-left").hide();
          } else {
            $(".fas.fa-chevron-left").show();
          }

          if(slide == 10) {
            $(".fas.fa-chevron-right").hide();
          } else {
            $(".fas.fa-chevron-right").show();
          }

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
              if(activeNodes.indexOf(d.id) != -1) {
                color = d.color;
              } else {
                color = blend_colors(d.color, "#F3F3F3", 0.90);
              }
              // console.log(color);
              return color;
            })

          d4.selectAll(".node").selectAll("text").remove();
          nodeLabel = d4.select("#node12").append("text")
            .html(function(d) {
              return d.label;
            })
            .attr('text-anchor', 'middle')
            .style('font-size', function(d) { return Math.min(2 * radius(d.weight), (2 * radius(d.weight)) / this.getComputedTextLength() * 12) + 'px'; })//12
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
              if(activeLinks.indexOf(d.id) != -1) {
                op = 0.9;
              } else {
                op = 0.4;
              }
              // console.log(color);
              return op;
            })
            .attr("stroke-width", function(d) {
              var sw;
              // console.log(activeNodes.indexOf(d.id));
              if(activeLinks.indexOf(d.id) != -1) {
                sw = 2;
              } else {
                sw = 1;
              }
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

        function fillNodes(ids) {
          nodes = [];
          ids.forEach(function(item, index) {
            nodes.push(allNodes[item]);
          });
        };

        function fillLinks(ids) {
          links = [];
          ids.forEach(function(item, index) {
            links.push(allLinks[item]);
          });
        };

        $(".fas.fa-chevron-left").on("click", function() {
          // console.log(slide);
          $("#btn" + (slide - 1))[0].click();
        })
        $(".fas.fa-chevron-right").on("click", function() {
          // console.log(slide);
          $("#btn" + (slide + 1))[0].click();
        })

        d4.select("#btn1").on("click", function() {
          fillNodes([12,27,62,80,87]);
          fillLinks([1,2,3,4]);
          activeNodes = [12,27,62,80,87];
          activeLinks = [1,2,3,4];
          slide = 1;
          update(activeNodes, activeLinks);
        });

        d4.select("#btn2").on("click", function() {
          fillNodes([12,27,62,80,87,2,10,76]);
          fillLinks([1,2,3,4,81,82,83]);
          activeNodes = [12,2,10,62,76];
          activeLinks = [3,81,82,83];
          slide = 2;
          update(activeNodes, activeLinks);
        });

        d4.select("#btn3").on("click", function() {
          fillNodes([12,27,62,80,87,2,10,76,1,3,4,5,6,7,8,9,11,15,16,18,19,20,21,22,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,55,56,57,58,59,60,64,65,66,68,69,70,71,72,73,74,75,77,81,83,85,86,88,90,91,92,93,94,95]);
          fillLinks([1,2,3,4,81,82,83,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,99]);
          activeNodes = [12,27,1,3,4,5,6,7,8,9,11,15,16,18,19,20,21,22,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,55,56,57,58,59,60,64,65,66,68,69,70,71,72,73,74,75,77,81,83,85,86,88,90,91,92,93,94,95];
          activeLinks = [2,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78];
          slide = 3;
          update(activeNodes, activeLinks);
        });

        d4.select("#btn4").on("click", function() {
          fillNodes([12,27,62,80,87,2,10,76,1,3,4,5,6,7,8,9,11,15,16,18,19,20,21,22,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,55,56,57,58,59,60,64,65,66,68,69,70,71,72,73,74,75,77,81,83,85,86,88,90,91,92,93,94,95]);
          fillLinks([1,2,3,4,81,82,83,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,99]);
          activeNodes = [12,27,41,62,2];
          activeLinks = [2,3,40,81,99];
          slide = 4;
          update(activeNodes, activeLinks);
        });

        d4.select("#btn5").on("click", function() {
          fillNodes([12,27,62,80,87,2,10,76,1,3,4,5,6,7,8,9,11,15,16,18,19,20,21,22,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,55,56,57,58,59,60,64,65,66,68,69,70,71,72,73,74,75,77,81,83,85,86,88,90,91,92,93,94,95,63]);
          fillLinks([1,2,3,4,81,82,83,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,94,95,99]);
          activeNodes = [12,27,40,63];
          activeLinks = [2,39,94,95];
          slide = 5;
          update(activeNodes, activeLinks);
        });

        d4.select("#btn6").on("click", function() {
          fillNodes([12,27,62,80,87,2,10,76,1,3,4,5,6,7,8,9,11,15,16,18,19,20,21,22,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,55,56,57,58,59,60,64,65,66,68,69,70,71,72,73,74,75,77,81,83,85,86,88,90,91,92,93,94,95,63,61]);
          fillLinks([1,2,3,4,81,82,83,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,94,95,5,79,99]);
          activeNodes = [12,27,50,61,80];
          activeLinks = [1,2,5,49,79];
          slide = 6;
          update(activeNodes, activeLinks);
        });

        d4.select("#btn7").on("click", function() {
          fillNodes([12,27,62,80,87,2,10,76,1,3,4,5,6,7,8,9,11,15,16,18,19,20,21,22,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,55,56,57,58,59,60,64,65,66,68,69,70,71,72,73,74,75,77,81,83,85,86,88,90,91,92,93,94,95,63,61,23,24,67,78,82]);
          fillLinks([1,2,3,4,81,82,83,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,94,95,5,79,6,7,8,9,98,99]);
          activeNodes = [12,80,67,82,23,24,78,61];
          activeLinks = [1,6,7,8,9,98,5];
          slide = 7;
          update(activeNodes, activeLinks);
        });

        d4.select("#btn8").on("click", function() {
          fillNodes([12,27,62,80,87,2,10,76,1,3,4,5,6,7,8,9,11,15,16,18,19,20,21,22,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,55,56,57,58,59,60,64,65,66,68,69,70,71,72,73,74,75,77,81,83,85,86,88,90,91,92,93,94,95,63,61,23,24,67,78,82,13,14,17,51,52,79,89]);
          fillLinks([1,2,3,4,81,82,83,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,94,95,5,79,6,7,8,9,98,84,85,86,87,88,89,96,99]);
          activeNodes = [12,87,17,52,79,13,14,51,89];
          activeLinks = [4,84,85,86,87,88,89,96];
          slide = 8;
          update(activeNodes, activeLinks);
        });

        d4.select("#btn9").on("click", function() {
          fillNodes([12,27,62,80,87,2,10,76,1,3,4,5,6,7,8,9,11,15,16,18,19,20,21,22,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,55,56,57,58,59,60,64,65,66,68,69,70,71,72,73,74,75,77,81,83,85,86,88,90,91,92,93,94,95,63,61,23,24,67,78,82,13,14,17,51,52,79,89,53,54,84]);
          fillLinks([1,2,3,4,81,82,83,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,94,95,5,79,6,7,8,9,98,84,85,86,87,88,89,96,90,91,92,93,99]);
          activeNodes = [12,87,13,14,53,54,84,89,82];
          activeLinks = [4,84,88,89,90,91,92,93];
          slide = 9;
          update(activeNodes, activeLinks);
        });

        d4.select("#btn10").on("click", function() {
          fillNodes([12,27,62,80,87,2,10,76,1,3,4,5,6,7,8,9,11,15,16,18,19,20,21,22,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,55,56,57,58,59,60,64,65,66,68,69,70,71,72,73,74,75,77,81,83,85,86,88,90,91,92,93,94,95,63,61,23,24,67,78,82,13,14,17,51,52,79,89,53,54,84]);
          fillLinks([1,2,3,4,81,82,83,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,94,95,5,79,6,7,8,9,98,84,85,86,87,88,89,96,90,91,92,93,99,100]);
          activeNodes = [12,87,51,10];
          activeLinks = [4,96,100];
          slide = 10;
          update(activeNodes, activeLinks);
        });

      }
    });
    
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
