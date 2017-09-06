import { Orgs } from '../../../api/organizations/organizations.js';
import { org_from_tmp, person_from_tmp } from '../../../api/tmp/methods.js';
import { similarOrgs, getOrg, getOrgByIndex } from '../../../api/organizations/methods.js';
import '../../components/similar/similar.js';
import '../../helpers.js';
import './lost.html';
import { omit } from 'lodash';
import { DocHead } from 'meteor/kadira:dochead';

Template.Lost.onCreated(function() {
  DocHead.setTitle('QQW - Lost & Found');
  let self = this;

  self.ready = new ReactiveVar();
  self.document = new ReactiveVar();
  self.match_index = 0;
  getOrgWithMatches(self);

});

function getOrgWithMatches( template ) {
  getOrgByIndex.call({ index: template.match_index }, ( error, result )=>{
    if (error) throw error;

    if (result && result.matches.length > 0) {
      template.match_index = result.index;
      template.document.set( result.document );
      template.ready.set( true );
    } else {
      template.match_index++;
      return getOrgWithMatches( template );
    }

  })
}

Template.Lost.events({

  'click .js-lost-nav-next': function ( event, template ) {
    event.preventDefault();
    template.match_index++;
    console.log(template.match_index);
    template.ready.set(false);
    getOrgWithMatches(template);

  },

  'click .js-to-org': function ( event, template ) {
    var doc = omit(this, ['_id']);
    doc.source = 'manual';
    doc.user_id = Meteor.userId();
    doc.created_at = new Date();
    org_from_tmp.call({document: doc, id: this._id}, function(error, result){
        if (error) console.log(error);
    });
  },

  'click .js-to-person': function ( event, template ) {
    var doc = this;
    doc.source = 'manual';
    doc.user_id = Meteor.userId();
    doc.created_at = new Date();
    person_from_tmp.call({document: doc, id: this._id}, function(error, result){
        if (error) console.log(error);
    });
  }

});

Template.Lost.helpers({

  lost: function () {
    return Template.instance().document.get();
  },

  ready: function () {
    return Template.instance().ready.get();
  },

  nav: function () {
    let i = Template.instance().match_index;
    let nav = { next: true };
    if ( i > 0 ) {
      nav.prev = true;
    }
    return nav;
  }

});
