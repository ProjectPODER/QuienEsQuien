import cytoStyle from './style';
import visualizationEvents from './events';
import updateVizualization from './lib';
import './viz.html';


const LIMIT = 1000;

Template.cytoscapeVisualization.onCreated(function() {

  const self = this;
  const default_states = { state: true, ready: false, limit: 10 };

  self.labels = new ReactiveVar(false);
  self.ready = new ReactiveVar(false);
  self.origin = new ReactiveDict();
  self.origin.setDefault(default_states);
  self.board = new ReactiveDict();
  self.board.setDefault(default_states);
  self.shareholder = new ReactiveDict();
  self.shareholder.setDefault(default_states);
  self.shares = new ReactiveDict();
  self.shareholder.setDefault(default_states);
  self.competitor = new ReactiveDict();
  self.competitor.setDefault(default_states);

  self.autorun(() => {
    const data = Template.currentData();
    const origin = data.origin;
    const id = origin._id;
    if (origin.collection === 'persons') {
      const handle = self.subscribe('membersOfPerson', origin.simple, LIMIT, {
        onReady() {
          // FIXME really wired shit
          // we have to put this empty callback here
          // but then use the if below
        },
      });
      if (handle.ready()) {
        self.board.set('count', origin.board().count());
        self.shares.set('count', origin.shares().count());
      }
      self.ready.set(handle.ready());
    }

    if (origin.collection === 'orgs') {
      const handle = self.subscribe('membersOfOrganization', id, LIMIT, {
        onReady() {
          // FIXME really wired shit
          // we have to put this empty callback here
          // but then use the if below
        },
      });
      if (handle.ready()) {
        self.board.set('count', origin.board().count());
        self.shares.set('count', origin.shares().count());
        self.shareholder.set('count', origin.shareholders().count());
      }
      self.ready.set(handle.ready());
    }
  });
});

Template.cytoscapeVisualization.helpers({
  ready() {
    return Template.instance().ready.get();
  },

  name() {
    const doc = Template.instance().data.origin;
    return doc.name;
  },

  relations() {
    const a = [];
    const doc = Template.instance().data.origin;
    const boardCount = Template.instance().board.get('count');
    const sharesCount = Template.instance().shares.get('count');
    const shareholderCount = Template.instance().shareholder.get('count');
    if (doc.immediate_parent) {
      a.push('parent');
    }
    // if (doc.competitors && doc.competitors.length > 0) {
    //   a.push('competitor');
    // }
    if (doc.suborgs && doc.suborgs.length > 0) {
      a.push('suborg');
    }
    if (boardCount > 0) {
      a.push('board');
    }
    if (sharesCount > 0) {
      a.push('shares');
    }
    if (shareholderCount > 0) {
      a.push('shareholder');
    }
    return a;
  },
});

function getSelector(string) {
  if (string === 'shareholder') {
    return '[org_id][role="shareholder"]';
  }
  if (string === 'shares') {
    return '[sob_org][role="shareholder"]';
  }
  if (string === 'board') {
    return '[department="board"]';
  }
  if (string === 'origin') {
    return '.origin';
  }
  return null;
}

function toggleNodes(cy, selector, opacity) {
  const nodes = cy.$(selector);
  const origin = cy.$('.origin');

  nodes.animate({
    style: {
      opacity,
    },
  }, {
    duration: 350,
  });

  nodes.edgesWith(origin).animate({
    style: {
      opacity,
    },
  }, {
    duration: 350,
  });
}

Template.cytoscapeVisualization.events({
  'click .viz-controls li.image': function (event, templateInstance) {

    event.preventDefault();
    event.stopPropagation();

    const png64 = templateInstance.cy.png({ bg: '#fff' });
    self.$('#imageModal').modal();
    self.$('#imageModal .popup-image').attr('src', png64);
  },

  'click .viz-controls li.toggle-labels': function (event, templateInstance) {

    event.preventDefault();
    event.stopPropagation();

    const state = templateInstance.labels.get();

    if (state) {
      templateInstance.cy.nodes().style({
          'text-opacity': 0,
          'text-background-opacity': 0,
      });

      templateInstance.labels.set(false);
      templateInstance.$(event.currentTarget).removeClass('inset-shadow');
    } else {
      templateInstance.cy.nodes().style({
          'text-opacity': 0.8,
          'text-background-opacity': 0.7,
      });

      templateInstance.labels.set(true);
      templateInstance.$(event.currentTarget).addClass('inset-shadow');
    }
  },

  'click .viz-controls li.viz-refresh': function (event, templateInstance) {
    event.preventDefault();
    event.stopPropagation();
    templateInstance.cy.nodes().remove();
    templateInstance.$('.viz-legend li').removeClass('inset-shadow');
    ['origin', 'board', 'parent', 'suborg', 'shares', 'shareholder'].forEach((element) => {
      if (templateInstance[element]) {
        templateInstance[element].set('state', false);
      }
    });

    templateInstance.labels.set(false);
    templateInstance.$('.toggle-labels').removeClass('inset-shadow');

    updateVizualization(templateInstance);

    //template.cy.resize();
    //template.cy.forceRender();

  },

  'click .viz-legend li': function (event, templateInstance) {

    event.preventDefault();
    event.stopPropagation();

    const target = event.currentTarget;
    const string = templateInstance.$(target).text().trim();
    const state = templateInstance[string].get('state');
    const selector = getSelector(string);

    if (state) {
      toggleNodes(templateInstance.cy, selector, 0);
      templateInstance[string].set('state', false);
      templateInstance.$(target).addClass('inset-shadow');
    } else {
      toggleNodes(templateInstance.cy, selector, 1);
      templateInstance[string].set('state', true);
      templateInstance.$(target).removeClass('inset-shadow');
    }
  },

});

Template.cytoscapeVisualization.onRendered(function() {
  const self = this;

  Promise.all([import('cytoscape'), import('cytoscape-cola')])
  .then((array) => {
    const cytoscape = array[0].default;
    const cycola = array[1].default;

    cycola(cytoscape);

    self.cy = cytoscape({
      container: self.$('#visualization-cytoscape'), // container to render in
      style: cytoStyle,
    });

    updateVizualization(self);
    visualizationEvents(self.cy);
  });
});
