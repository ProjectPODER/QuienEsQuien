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
      label: 'data(name)',
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
      'background-color': '#2a0f25',
      'border-color': '#000',
    },
  }, {
    selector: '[role="board member"]',
    style: {
      'background-color': '#28365f',
    },
  }, {
    selector: '[!person_id][department="board"]',
    style: {
      label: 'data(sob_org)',
    },
  }, {
    selector: '[role="shares"]',
    style: {
      'background-color': '#226e50',
    },
  }, {
    selector: '[source="cargografias:argentina"]',
    style: {
      'background-color': '#acd1e7',
    },
  }, {
    selector: '[role="shareholder"]',
    style: {
      'background-color': '#6d7e34',
      'border-width': 2,
    },
  }, {
    selector: '[role="parent"]',
    style: {
      'background-color': '#c47777',
    },
  }, {
    selector: '[role="suborg"]',
    style: {
      'background-color': '#c496d9',
    },
  }, {
    selector: '[role="supplier"]',
    style: {
      'background-color': '#d5f0da',
      'border-width': 0,
      'background-image': [
      '/images/visualization/file-text-o.svg'
      ],
      'background-fit': 'cover',
      'background-repeat': 'no-repeat',
      'background-clip': 'none',
      'background-image-opacity': 0.9,

    },
  }, {
    selector: '[role="solicitor"]',
    style: {
      'background-color': '#d5f0da',
      'border-width': 0,
      'background-image': [
      '/images/visualization/file-text-o.svg'
      ],
      'background-fit': 'cover',
      'background-repeat': 'no-repeat',
      'background-clip': 'none',
      'background-image-opacity': 0.9,
    },
  }, {

    selector: '.torre-de-control',
    style: {
      'border-width': 0,
      'background-color': '#fff',
      'background-image': [
      '/images/visualization/investigation_icon.svg'
    ],
    'background-fit': 'cover',
    'background-repeat': 'no-repeat',
    'background-clip': 'none',
    'background-image-opacity': 0.9,
    }
  }, {
    selector: '[collection="organizations"]',
    style: {
      'border-width': 0,
      'background-image': [
      '/images/visualization/building-o.svg'
    ],
    'background-fit': 'cover',
    'background-repeat': 'no-repeat',
    'background-clip': 'none',
    'background-opacity': 0.4,
    'background-image-opacity': 1,
    'padding': 0,
    'shape': 'rectangle',
    }
  }, {
    selector: '[collection="persons"]',
    style: {
      'border-width': 0,
      'background-image': [
      '/images/visualization/user-o.svg'
    ],
    'background-fit': 'cover',
    'background-repeat': 'no-repeat',
    'background-clip': 'none',
    'background-opacity': 0.4,
    'background-image-opacity': 1,
    'shape': 'ellipse',
    }
  }, {
    selector: 'edge',
    style: {
      width: 0.5,
      'line-color': '#ddd',
      'target-arrow-color': '#ddd',
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
