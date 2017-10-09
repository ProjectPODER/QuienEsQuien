export default [ // the stylesheet for the graph
  {
    selector: 'node',
    style: {
      'background-color': '#666',
      'border-width': 1,
      'border-color': '#fff',
      color: '#000',
      'font-weight': 'normal',
      'text-background-color': '#fff',
      'text-opacity': 0,
      'text-background-opacity': 0,
      'text-background-shape': 'roundrectangle',
      'text-margin-x': 2,
      'text-margin-y': 2,
    },
  }, {
    selector: '[size]',
    style: {
      width: 'data(size)',
      height: 'data(size)',
    },
  }, {
    selector: '.origin',
    style: {
      'background-color': '#2a0e24',
      'border-color': '#000',
      label: 'data(name)',
    },
  }, {
    selector: '[department="board"]',
    style: {
      'background-color': '#244062',
      label: 'data(person)',
    },
  }, {
    selector: '[!person_id][department="board"]',
    style: {
      label: 'data(sob_org)',
    },
  }, {
    selector: '[sob_org][role="shareholder"]',
    style: {
      'background-color': '#317940',
      label: 'data(sob_org)',
    },
  }, {
    selector: '[person_id][role="shareholder"]',
    style: {
      'background-color': '#a07949',
      'border-width': 2,
      label: 'data(person)',
    },
  }, {
    selector: '[org_id][role="shareholder"]',
    style: {
      'background-color': '#a07949',
      'border-width': 1,
      label: 'data(org)',
    },
  }, {
    selector: '[role="parent"]',
    style: {
      'background-color': '#cd85be',
      label: 'data(name)',
    },
  }, {
    selector: '[role="suborg"]',
    style: {
      'background-color': '#acc8ea',
      label: 'data(name)',
    },
  }, {
    selector: 'edge',
    style: {
      width: 0.5,
      'line-color': '#d4f0da',
      'target-arrow-color': '#d4f0da',
      'target-arrow-shape': 'triangle-backcurve',
      'curve-style': 'bezier',
      'text-opacity': 0,
      'text-background-opacity': 0,
      label: 'data(label)',
      'text-rotation': 'autorotate',
      'font-size': 8,
    },
  },
];
