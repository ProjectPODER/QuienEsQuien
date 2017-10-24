import cytoStyle from './style';
import visualizationEvents from './events';
import { colaOptions, updateVizualization } from './lib';
import './viz.html';

Template.cytoscapeVisualization.onCreated(function() {

  const self = this;
  const default_states = { state: true, ready: false, limit: 10 };

  self.labels = new ReactiveVar(false);
  self.ready = new ReactiveVar(false);
  self.board = new ReactiveDict();
  self.board.setDefault(default_states);
  self.shareholder = new ReactiveDict();
  self.shareholder.setDefault(default_states);
  self.shares = new ReactiveDict();
  self.shareholder.setDefault(default_states);
  self.competitor = new ReactiveDict();
  self.competitor.setDefault(default_states);
  self.posts = new ReactiveDict();
  self.posts.setDefault(default_states);
  self.suppliesContracts = new ReactiveDict();
  self.suppliesContracts.setDefault(default_states);
  self.contracts = new ReactiveDict();
  self.contracts.setDefault(default_states);
  self.cyto = new ReactiveDict();
  self.cyto.setDefault(default_states);
  self.stories = new ReactiveDict();
  self.stories.setDefault(default_states);
  self.autorun(() => {
    const data = Template.currentData();
    const origin = data.origin;
    // make sure we rerun when memberships change
    // origin.allMemberships();
    const sharesHandle = Meteor.subscribe('sharesOfEntity', origin._id, origin.collectionName());
    self.shares.set('ready', sharesHandle.ready());
    self.shares.set('count', origin.shares().count());
    if (origin.collectionName() === 'organizations') {
      const boardHandle = Meteor.subscribe('boardMembersOfOrganization', origin._id);
      self.board.set('ready', boardHandle.ready());
      self.board.set('count', origin.board().count());
      const shareHoldersHandle = Meteor.subscribe('shareHoldersOfOrganization', origin._id);
      self.shareholder.set('ready', shareHoldersHandle.ready());
      self.shareholder.set('count', origin.shareholders().count());
      const suppliesContracts = Meteor.subscribe('contractsSuppliedByOrganization', origin._id);
      self.suppliesContracts.set('ready', suppliesContracts.ready());
      self.suppliesContracts.set('count', origin.contractsSupplied().count());
      const contracts = Meteor.subscribe('contractsSolicitedByOrganization', origin._id);
      self.contracts.set('ready', contracts.ready());
      self.contracts.set('count', origin.contractsSolicited().count());
      const postsHandle = Meteor.subscribe('postsOfOrganization', origin._id);
      self.posts.set('ready', postsHandle.ready());
      self.posts.set('count', origin.posts().count());

      // FIXME implemnt stories post rindecuentas tag
      // const stories = Meteor.subscribe('storiesRelatedToOrganization', origin._id);
      // self.stories.set('ready', stories.ready());
    }
    if (origin.collectionName() === 'persons') {
      const boardHandle = Meteor.subscribe('boardMembershipsOfPerson', origin._id);
      self.board.set('ready', boardHandle.ready());
      self.board.set('count', origin.board().count());
      const suppliesContracts = Meteor.subscribe('contractsSuppliedByPerson', origin._id);
      self.suppliesContracts.set('ready', suppliesContracts.ready());
      self.suppliesContracts.set('count', origin.contractsSupplied().count());
      const postsHandle = Meteor.subscribe('postsOfPerson', origin._id);
      self.posts.set('ready', postsHandle.ready());
      self.posts.set('count', origin.posts().count());
      // FIXME implemnt stories post rindecuentas tag
      // const stories = Meteor.subscribe('storiesRelatedToOrganization', origin._id);
      // self.stories.set('ready', stories.ready());
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
    const a = new Set();
    const instance = Template.instance();
    const doc = Template.currentData().origin;
    if (instance.shares.get('count') > 0) {
      a.add('shares');
    }
    if (instance.shareholder.get('count') > 0) {
      a.add('shareholder');
    }
    if (instance.board.get('count') > 0) {
      a.add('board');
    }
    if (instance.suppliesContracts.get('count') > 0) {
      a.add('solicitor');
    }
    if (instance.contracts.get('count') > 0) {
      a.add('supplier');
    }
    if (instance.posts.get('count') > 0) {
      a.add('post');
    }
    if (doc.hasOwnProperty('immediate_parent')) {
     a.add('parent');
    }
    if (doc.hasOwnProperty('competitors')) {
     a.add('competitor');
    }
    if (doc.hasOwnProperty('suborgs') && doc.suborgs.length > 0) {
     a.add('suborg');
    }

    return Array.from(a);
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
  const origin = self.data.origin;

  Promise.all([import('cytoscape'), import('cytoscape-cola')])
  .then((array) => {
    const cytoscape = array[0].default;
    const cycola = array[1].default;
    const o = origin.originNode();
    cytoscape.use(cycola);
    const cy = cytoscape({
      container: self.$('#visualization-cytoscape'), // container to render in
      style: cytoStyle,
      elements: [o],
      // layout: colaOptions,
    });
    self.cy = cy;
    self.autorun(() => {
      origin.board(true).forEach(doc => (cy.add(doc)));
      origin.shares(true).forEach(doc => (cy.add(doc)));
      origin.posts(true).forEach(doc => (cy.add(doc)));
      origin.contractsSupplied(true).forEach(doc => (cy.add(doc)));
      if (origin.collectionName() === 'organizations') {
        origin.shareholders(true).forEach(doc => (cy.add(doc)));
        origin.contractsSolicited(true).forEach(doc => (cy.add(doc)));
      }

      self.cy.ready((event) => {
        const cy = event.cy;
        self.cyto.set('ready', true);
        // FIXME SEE ONCREATED
        // origin.stories(true).forEach(doc => (cy.add(doc)));

        // FIXME once we have mongo 3.4 use graphLookup
        // to get relations of nodes w/ highest count
        // const eles = cy.elements('node');

        cy.layout(Object.assign(colaOptions, {
          ready() {
            return cy.fit();
          }
        })).run();
        // cy.center('.origin');
      });
    });

    // updateVizualization(self);
    visualizationEvents(self.cy);
  });
});
