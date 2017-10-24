import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

export default function visualizationEvents(cy) {
  cy.on('tapdragover', 'node', function(event) {
    const node = event.target;
    if ('origin'.indexOf(node.json().classes) < 0 && node.data().mongoId) {
      $('html,body').css('cursor', 'pointer');
    }
  });

  cy.on('tapdragover', 'node', function() {
    $('html,body').css('cursor', 'default');
  });

  cy.on('tapdragover', 'node', function(event) {
    const node = event.target;
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
    const edge = event.target;
    edge.animate({
      style: {
        'text-opacity': 0.8,
      },
    }, {
      duration: 350,
    });
  });

  cy.on('tapdragout', 'node', function(event) {
    const node = event.target;
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
    const edge = event.target;
    edge.animate({
      style: {
        'text-opacity': 0,
      },
    }, {
      duration: 350,
    });
  });

  cy.on('tap', 'node', (event) => {
    const node = event.target;
    const data = node.data();
    if (node.json().classes === 'origin') {
      return true;
    }
    if (data.collection === 'organizations') {
      const pathDef = '/orgs/:_id#view';
      return FlowRouter.go(pathDef, {
        _id: data.name,
      });
    }
    const pathDef = '/persons/:_id#view';
    return FlowRouter.go(pathDef, {
      _id: data.name,
    });
  });
}
