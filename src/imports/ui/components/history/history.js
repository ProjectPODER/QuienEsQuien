import { Revisions } from '../../../api/revisions/revisions.js';
import { filter, orderBy, isObject } from 'lodash';
import './history.html'

const historySub = new SubsManager({
  cacheLimit: 50
});

Template.History.onCreated(function() {
  let self = this;
  let id = self.data.document._id;
  self.ready = new ReactiveVar(false);
  self.autorun(function() {
    let handle = historySub.subscribe('documentRevisions', id);
    // TODO set attribute on heach patch (hide:bool) which we
    // check to see if we add the 'hide' classe in template
    // .js-toggle-patch event would toggle this attribute
    // thus alowing us to toggle tooltip to read "show|hide"
    // there should also be a similar attribute on outer document
    // and that would get toggled by js-toggle-all-patches
    self.ready.set(handle.ready());
  });
});

Template.History.events({
  'click .js-toggle-patch': function(event, template) {
    event.preventDefault();
    let classes = template.$(event.currentTarget).attr('class');
    let data = template.$(event.currentTarget).data();
    let toToggle = '.changeset.patch-' + data.patchIndex;
    template.$(toToggle).toggleClass('hide');
  },

  'click .js-toogle-all-patches': function(event, template) {
    event.preventDefault();
    template.$('.changeset').toggleClass('hide');
  },

  'click .js-undo-patch': function(event, template) {
    event.preventDefault();
  }
});

Template.PatchHeader.events({
  'click .js-toggle-patch': function(event, template) {
    let self = this;
    event.preventDefault();
    let data = template.$(event.currentTarget).data();
    let toToggle = '.changeset.patch-' + data.patchIndex;
    if (self.showUserName){
      // TODO investigate
      // this allows us to use the same event for
      // user and document history
      // probably a better way to do it
      template.$(toToggle).toggleClass('hide');
    } else {
      $(toToggle).toggleClass('hide');
    }
  },

  'click .js-undo-patch': function(event, template) {
    event.preventDefault();
  }
});

Template.History.helpers({

  revisions() {
    let self = this;
    let id = self.document._id;
    if ( id ) {
      let revisions = Revisions.find({ documentId: id }, { sort: {date: -1}});
      return revisions.fetch();
    }
  },

  ready: function(){
    return Template.instance().ready.get();
  }

});

Template.PatchHeader.helpers({

  patch() {
    let data = Template.currentData();
    let revision = data.p;
    if (revision){
      let length = revision.patch.length;
      let updates = revision.patch.filter((y)=>{
        return (y.op === 'replace')
      }).length;
      let adds = revision.patch.filter((y)=>{
        return (y.op === 'add')
      }).length;
      let dels = revision.patch.filter((y)=>{
        return (y.op === 'remove')
      }).length;

      let doc = {
        length: length,
        updates: updates,
        adds: adds,
        dels: dels
      }
      return doc
    }

  },

  updatedBy: function(userId) {
    if (userId){
      let user = Meteor.users.findOne(userId);
      if (user){
        return user.username;
      }
      return 'Unknown'
    }
  }

})

Template.Hunk.helpers({

  icon: function( op ) {
    if ( op ) {
      if (op === 'add') {
        return 'plus'
      }
      if (op === 'remove') {
        return 'remove'
      }
      if (op === 'replace') {
        return 'pencil'
      }
    }
  },

  formatValue: function( value ) {
    if ( isObject(value) ) {
      return JSON.stringify(value);
    }
    return value
  }

});
