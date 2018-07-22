import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import '../../ui/layouts/app-body.js';

// //GARecordPage = function(pageLocation) {
// ga('create', 'UA-122512835-1', 'auto');
// ga('send', 'pageview', {
//   page: pageLocation
// });
// }


FlowRouter.route('*', {
  waitOn() {
    return import('../../ui/pages/404/404.js');
  },
  action() {
    // //GARecordPage('/404');
    this.render('ApplicationLayout', 'pageNotFound');
  },
});

FlowRouter.route('/', {
  waitOn() {
    return import('../../ui/pages/home/home.js');
  },
  action: function () {
    // //GARecordPage('/');
    this.render('ApplicationLayout', 'Home');
  },
  name: "home",
});

FlowRouter.route('/dash', {
  waitOn() {
    return import('../../ui/pages/users/users.js');
  },
  action: function () {
    // //GARecordPage('/dash');
    this.render('ApplicationLayout', 'userDash');
  },
  name: 'userDash',
});

FlowRouter.route('/persons/add', {
  waitOn() {
    return import('../../ui/pages/personas/persons.js');
  },
  action: function () {
    this.render('ApplicationLayout', 'PersonSubmit');
  },
  name: 'person.submit',
});

FlowRouter.route('/orgs/add', {
  waitOn() {
    return import('../../ui/pages/organizations/orgs.js');
  },
  action: function () {
    this.render('ApplicationLayout', 'OrgSubmit');
  },
  name: 'org.submit',
});

FlowRouter.route('/persons', {
  waitOn() {
    return import('../../ui/pages/index/persons.js');
  },
  action: function () {
    //GARecordPage('/persons');
    this.render('ApplicationLayout', 'Persons');
  },
  name: 'persons',
});

FlowRouter.route('/orgs', {
  waitOn() {
    return import('../../ui/pages/index/organizations.js');
  },
  action: function () {
    //GARecordPage('/orgs');
    this.render('ApplicationLayout', 'Orgs');
  },
  name: 'orgs',
});

FlowRouter.route('/contracts/', {
  waitOn() {
    return import('../../ui/pages/index/contracts.js');
  },
  action: function () {
    //Enviar parámetros del query via window
    //TODO: Buscar un método mejor
    //GARecordPage('/contracts');
    window.queryParams = this._queryParams.keys;
    this.render('ApplicationLayout', 'Contracts');
  },
  name: 'contracts',
});

FlowRouter.route('/persons/:_id', {
  waitOn() {
    return import('../../ui/pages/personas/persons.js');
  },
  action: function (params) {
    //GARecordPage('/persons/'+params._id);
    this.render('ApplicationLayout', 'showPersonWrapper');
  },
  name: 'personShow',
});

FlowRouter.route('/orgs/:_id', {
  waitOn() {
    return import('../../ui/pages/organizations/orgs.js');
  },
  action: function () {
    //GARecordPage('/orgs/'+params._id);
    this.render('ApplicationLayout', 'showOrgWrapper');
  },
  name: 'orgShow',
});

FlowRouter.route('/contracts/:_id', {
  waitOn() {
    return import('../../ui/pages/contracts/contracts.js');
  },
  action: function () {
    //GARecordPage('/contracts/'+params._id);
    window.queryParams = this._queryParams.keys;
    this.render('ApplicationLayout', 'showContractWrapper');
  },
  name: 'contractShow',
});

FlowRouter.route('/orgs/:_id/revisions/:revision', {
  action: function () {
    this.render('ApplicationLayout', 'showOrgWrapper');
  },
  name: 'orgShowRevision',
});

FlowRouter.route('/persons/:_id/revisions/:revision', {
  action: function () {
    this.render('ApplicationLayout', 'showPersonWrapper');
  },
  name: 'personShowRevision',
});

FlowRouter.route('/stats/', {
  waitOn() {
    return import('../../ui/pages/stats/stats.js');
  },
  action: function () {
    this.render('ApplicationLayout', 'Stats');
  },
  name: 'stats',
});

FlowRouter.route('/lost/', {
  waitOn() {
    return import('../../ui/pages/lost/lost.js');
  },
  action: function () {
    this.render('ApplicationLayout', 'Lost');
  },
  name: 'lost',
});

FlowRouter.route('/contact/success', {
  waitOn() {
    return import('../../ui/components/contact/contact.html');
  },
  action: function () {
    this.render('ApplicationLayout', 'contactSuccess');
  },
  name: 'contactSuccess',
});

FlowRouter.route('/contact/', {
  waitOn() {
    return import('../../ui/components/contact/contact.js');
  },
  action: function () {
    //GARecordPage('/contact/');
    this.render('ApplicationLayout','contactForm');
  },
  name: 'contactForm',
});

FlowRouter.route('/privacy/', {
  waitOn() {
    return import('../../ui/pages/privacy/privacy.js');
  },
  action: function () {
    //GARecordPage('/privacy/');
    this.render('ApplicationLayout', 'aviso_de_privacidad');
  },
  name: 'avisoDePrivacidad',
});

FlowRouter.route('/about/', {
  waitOn() {
    return import('../../ui/pages/about/about.js');
  },
  action: function () {
    //GARecordPage('/about/');
    this.render('ApplicationLayout', 'acerca_de');
  },
  name: 'acerca_de',
});
