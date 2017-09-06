import moment from 'moment';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import i18n from 'meteor/universe:i18n';
import {
  accountsUIBootstrap3,
} from 'meteor/ian:accounts-ui-bootstrap-3';
import './nav.html';

Template.manualAdd.events({
  'click #add_one': function(event, template) {
    const route = FlowRouter.getRouteName();
    if (route === 'persons' || route === 'personShow') {
      FlowRouter.go('/persons/add');
    }
    if (route === 'orgs' || route === 'orgShow') {
      FlowRouter.go('/orgs/add');
    }
  },
});

Template.nav.onCreated(function() {
  const template = this;
  const lang = i18n.getLocale();
  template.locale = new ReactiveVar();

  if (/^en/.test(lang)) {
    template.locale.set('en');
  }
  if (/^es/.test(lang)) {
    template.locale.set('es');
  }

  i18n.onChangeLocale((newLocale) => {
    template.locale.set(newLocale);
    accountsUIBootstrap3.setLanguage(newLocale);
    moment.locale(newLocale);
  });
});

Template.nav.events({
  'click .toggleLang': function(event, template) {
    event.preventDefault();
    const lang = i18n.getLocale();
    
    if (/^en/.test(lang)) {
      i18n.setLocale('es');
    }
    if (/^es/.test(lang)) {
      i18n.setLocale('en');
    }
  },
});

Template.nav.helpers({
  language() {
    return Template.instance().locale.get();
  },
});

Template.Aside.helpers({
  showSideBarContent() {
    return (FlowRouter.getRouteName() === 'userDash');
  },
});
