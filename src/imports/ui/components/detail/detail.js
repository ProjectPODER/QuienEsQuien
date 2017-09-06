import { union, find, reject } from 'lodash';
import { Session } from 'meteor/session'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import i18n from 'meteor/universe:i18n';
import { Revisions } from '../../../api/revisions/revisions';
import { profile_tabs } from '../../components/tabs';
import './detail.html';
import isAdmin from '../../helpers';

let tabs = profile_tabs;

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
    let org = Template.instance().data.document;
    let rev = Revisions.findOne({documentId: org._id});
    if (org && org.contract_count) {
      let f = find(tabs.public, (x)=>{
        return (x.slug === 'contracts')
      })

      if (!f) {
       tabs.public.push({
        name: i18n.__('contracts'),
        slug: 'contracts'
       });
      }

    }

    let f = find(tabs.admin, (x)=>{
      return (x.slug === 'history')
    })

    if ( rev && !f ) {
       tabs.admin.push({
        name: i18n.__('history'),
        slug: 'history'
       });
    }

    if (!rev && f ) {
      tabs.admin = reject(tabs.admin, (x)=>{
        return (x.slug === 'history')
      })
    }

    if (isAdmin()) {
      return union(tabs.public, tabs.admin)
    } else {
      return tabs.public
    }

  },

  activeTab: function() {
    return Session.get('activeTab');
  }
})
