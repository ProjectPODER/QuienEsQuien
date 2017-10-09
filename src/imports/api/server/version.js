const version = require('../../../package.json').version;

WebApp.connectHandlers.use('/version', (req, res) => {
  res.writeHead(200);
  res.end(version);
});
