import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import i18n from 'meteor/universe:i18n';
import { Notifications } from 'meteor/gfk:notifications';
import { DocHead } from 'meteor/kadira:dochead';
import { Orgs } from '../../../api/organizations/organizations.js';
import { simpleName } from '../../../api/lib';
import '../../../api/organizations/relations.js';
import '../../helpers.js';
import '../../components/memberships/memberships.js';
import '../../components/visualizations/viz.js';
import '../../components/similar/similar.js';
import '../../components/history/history.js';
import '../../components/contracts/contracts.js';
import '../../components/detail/detail.js';
import '../../components/image/image.js';
import { prepareSubArray } from '../../components/visualizations/relations.js';
import { isEmpty } from 'lodash';
import './orgs.html';

const LIMIT = 1000;

orgCompetitorsSub = new SubsManager({
  cacheLimit: 50
});

Template.showOrgWrapper.onCreated(function() {
  const self = this;

  self.org = new ReactiveVar(false)
  self.ready = new ReactiveVar(false);
  self.autorun(() => {
    const id = FlowRouter.getParam('_id');
    const handle = self.subscribe('org', id, {
      onReady() {
        const org = Orgs.findOne({
          $or: [
            {
              _id: id,
            }, {
              simple: id,
            }, {
              name: id,
            }, {
              names: id,
            },
          ],
        });
        Session.set("currentDocumentId", org._id);
        org.collection = 'orgs';
        self.org.set(org);
      },
    });
    self.ready.set(handle.ready());
  });
  $(document).ready(function () {    
    $('nav').addClass("fixed-nav");
  });
});

Template.showOrgWrapper.helpers({

  ready() {
    return Template.instance().ready.get();
  },

  selectedOrganizationDoc() {
    return Template.instance().org.get();
  }

})

AutoForm.hooks({
  updateOrgForm: {
    after: {
      'method-update': function(error, result) {
        if (error){
          Notifications.error('Error', error.message);
        }
        if (result){
          Notifications.success(i18n.__("success"), i18n.__("organization successfully updated"));
        }
      },
      'method': function(error, result) {
        if (error){
          Notifications.error('Error', error.message);
        }
        if (result){
          Notifications.success(i18n.__("success"), i18n.__("organization successfully created"));
        }
      }
    }
  }
});

Template.orgView.helpers({
  isWebsite: function(value) {
    if (value === 'website') {
      return true
    } else {
      return false
    }
  },
  isEmpty(array) {
    return isEmpty(array)
  },
})

Template.orgView.onRendered(function() {
  DocHead.setTitle('QuiénEsQuién.Wiki - ' + Template.instance().data.document.names[0]);
  this.$(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })
})

Template.upsertOrganisationForm.helpers({
  orgsCollection: function() {
    return Orgs
  }
});

Template.competitors.helpers({
  ready: function() {
    return Template.instance().ready.get()
  },
  data: function(defined) {
    return prepareSubArray(Orgs, defined);
  },
  simpleName(string) {
    return simpleName(string);
  },
});

// Template.contract_amount.helpers({
//   format_currency: function(value) {
//     if (value == "MXN") {
//       return "Pesos mexicanos"
//     }
//     else if (value == "USD") {
//       return "Dólares estadounidense"
//     }
//     return value;
//   }
// })
