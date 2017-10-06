import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import i18n from 'meteor/universe:i18n';
import isAdmin from '../../helpers.js';
import './detail.html';

const tabs = new Set(['read', 'view']);

Template.DetailWrapper.onCreated(function(){
  const self = this;
  self.autorun(() => {
    FlowRouter.watchPathChange();
    const current = FlowRouter.current();
    const hash = current.context.hash;
    Session.set('activeTab', hash);
  });
});

Template.DetailWrapper.helpers({
  documentData: function(){
    return Template.instance().data.document;
  },

  isOrganization: function(){
    return ( Template.instance().data.document.collection === 'orgs' );
  },

  isPerson: function(){
    return ( Template.instance().data.document.collection === 'persons' );
  },

  tabs: function () {
    let doc = Template.instance().data.document;
    const hasRevisions = (doc.revisions().count() > 0);
    const canEdit = (isAdmin() || doc.editableBy(Meteor.userId()));
    if (doc && doc.contract_count) {
      // add contract tab
       tabs.add('contracts');
    }
    // add history tab
    if (hasRevisions) {
       tabs.add('history');
    }
    // add edit tabs
    if (canEdit) {
      tabs.add('edit');
    }
    const array = Array.from(tabs);
    return array.map(s => ({ name: i18n.__(s), slug: s }))
  },

  activeTab: function() {
    return Session.get('activeTab');
  }
})
