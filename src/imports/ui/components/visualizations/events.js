import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

export default function visualizationEvents(cy) {
  cy.on('tapdragover', 'node', function(event) {
    const node = event.cyTarget;
    if ('origin'.indexOf(node.json().classes) < 0 && node.data().mongoId) {
      $('html,body').css('cursor', 'pointer');
    }
  });

  cy.on('tapdragover', 'node', function() {
    $('html,body').css('cursor', 'default');
  });

  cy.on('tapdragover', 'node', function(event) {
    const node = event.cyTarget;
    node.animate({
      style: {
        'text-opacity': 0.8,
        'text-background-opacity': 0.7,
      },
    }, {
      duration: 350,
    });
  });

  cy.on('tapdragover', 'edge', function(event) {
    const edge = event.cyTarget;
    const parallels = edge.parallelEdges();
    if (parallels.jsons() && parallels.jsons().length > 1) {
      edge.animate({
        style: {
          'text-opacity': 0.8,
        },
      }, {
        duration: 350,
      });
    }
  });

  cy.on('tapdragout', 'node', function(event) {
    const node = event.cyTarget;
    node.animate({
      style: {
        'text-opacity': 0,
        'text-background-opacity': 0,
      },
    }, {
      duration: 350,
    });
  });

  cy.on('tapdragout', 'edge', function(event) {
    const edge = event.cyTarget;
    const parallels = edge.parallelEdges();
    if (parallels.jsons() && parallels.jsons().length > 1) {
      edge.animate({
        style: {
          'text-opacity': 0,
        },
      }, {
        duration: 350,
      });
    }
  });

  cy.on('tap', 'node', (event) => {
    const node = event.cyTarget;
    // FIXME node.data() should have a name attribute
    // so here we could get the org / person by name or id
    const data = node.data();
    if (node.json().classes === 'origin') {
      return true;
    }
    if (data.id.substring(0, 2) === 'pP') {
      const pathDef = '/orgs/:_id#vista';
      return FlowRouter.go(pathDef, {
        _id: data.simple,
      });
    }
    if (data.role === 'suborg') {
      const pathDef = '/orgs/:_id#vista';
      return FlowRouter.go(pathDef, {
        _id: data.name,
      });
    }
    if (data.person_id) {
      const pathDef = '/persons/:_id#vista';
      return FlowRouter.go(pathDef, {
        _id: data.person_id,
      });
    } else if (data.org_id) {
      const pathDef = '/orgs/:_id#vista';
      return FlowRouter.go(pathDef, {
        _id: data.org_id,
      });
    }
    const pathDef = '/orgs/:_id#vista';
    return FlowRouter.go(pathDef, {
      _id: data.sob_org,
    });
  });
}
