import { FlowRouter } from 'meteor/ostrio:flow-router-extra'
import i18n from 'meteor/universe:i18n';
import { similarOrgs, getOrg, orgUpdate, orgRemove } from '../../../api/organizations/methods.js';
import { negateMatch, negateMatchBatch, approveMatch, matchChild } from '../../../api/matches/methods.js';
import { filter, uniq, last, omit, map, find, union, pick, keys, snakeCase, isEmpty } from 'lodash';
import { addHunk, replaceHunk, addRelationship, applyPatch, addRelationships } from './lib.js';
import './similar.html';
import '../history/history.js';
import { compare } from 'fast-json-patch';
//import { diff } from 'rus-diff';
var merge = require('merge'), original, cloned;

export const DATA_ARRAYS = ['names', 'owns', 'owned_by', 'memberships', 'competitors'];
const IGNORED_PATHS_Y = ['name', 'simple', '_id', 'created_at', 'lastModified'];
const IGNORED_PATHS = union(IGNORED_PATHS_Y, DATA_ARRAYS)

// !! Merge Rules !!
// merges must be handeld per attribute

// 1. Do not unset anything
// 2. some fields should be avoided
// 3. It is not the same add an element to an array as update some field.


Template.Similar.onCreated(function() {
  var self = this;
  self.ready = new ReactiveVar();
  self.similar = new ReactiveVar();
  self.showSpinner = new ReactiveVar(false);
  const simple = self.data.document.simple;
  // TODO matching algo should check against previously approved,
  // parents and children and set an attribute to be used in the interface
  similarOrgs.call({
    simple: simple
  }, function(error, result){
      if (error) console.log(error);

      self.ready.set(true);
      self.similar.set(result);
  });
});

Template.Similar.helpers({

  ready: function() {
    return Template.instance().ready.get();
  },

  showSpinner: function() {
    return Template.instance().showSpinner.get();
  },

  matches: function() {
    return Template.instance().similar.get();
  },

  settings: function() {
    // TODO sortOrder
    return {
      rowsPerPage: 10,
      showFilter: true,
      showRowCount: false,
      useFontAwesome: true,
      rowClass: function(item) {
        if (item.parent) return 'parent';
        if (item.child) return 'child';
        return 'similar-row';
      },
      fields: [
        { key: 'simple', sortOrder: 5, label: 'simple', tmpl: Template.SimilarSimpleCell },
        { key: 'mean', sortOrder: 0, sortDirection: -1, label: 'mean' },
        { key: 'levenshtein', sortOrder: 3, label: 'levenshtein' },
        { key: 'dice', sortOrder: 2, label: 'dice' },
        { key: 'tversky', sortOrder: 1, label: 'tversky' },
        { key: 'score', sortOrder: 4, label: 'score' },
        {
          key: '_id',
          label: i18n.__('actions'),
          cellClass: 'similar-actions',
          tmpl: Template.StringMatchCell,
          sortable: false
        },
      ]
    };
  }

});

Template.Similar.events({
  'click .simple': function (event, template) {
    event.preventDefault();
    let simple = template.$(event.currentTarget).text().trim();
    getOrg.call({
      simple: simple
    }, ( error, result ) => {
        if ( error ) console.log(error);

        let o = ['_id', 'simple', 'source', 'created_at',
        'lastModified', 'memberships', 'competitors'];
        let json = JSON.stringify(omit(result, o), null, 2);

       // open modal
        bootbox.dialog({
          title: simple,
          message: '<pre>'+json+'</pre>',
          buttons: {
            confirm: {
                label: '<i class="fa fa-times"></i> Cancel',
                className: 'btn-danger'
            },
            cancel: {
                label: '<i class="fa fa-exchange"></i> Confirm',
                className: 'btn-success'
            },
            parent: {
                label: '<i class="fa fa-level-up" aria-hidden="true"></i> Parent',
            },
            child: {
                label: '<i class="fa fa-level-down" aria-hidden="true"></i> Child',
            },
          },
          onEscape: true,
          backdrop: true,
          callback: function (x) {
              console.log('This was logged in the callback: ' + x);
          }
        });
    });

  },

  'click .js-match-negate': function ( event, template ) {
    event.preventDefault();

    template.showSpinner.set(true);

    let self = this;
    let doc = template.data.document;

    negateMatch.call(
      { origin: doc.simple, match: self.simple, collection: 'organizations'},
      function(error, result){
        if (error) console.log(error);

        template.similar.set(result);
        template.showSpinner.set(false);

    });
  },

  'click .js-match-negate-all-diabled': function ( event, template ) {
    event.preventDefault();

    template.showSpinner.set(true);
    let similar = template.similar.get();
    let doc = template.data.document;

    negateMatchBatch.call(
      { origin: doc.simple, match: similar.map((x)=>(x.simple)), collection: 'organizations'},
      function(error, result){
        if (error) console.log(error);

        FlowRouter.go('/orgs/' + doc.simple + '#history');
        template.showSpinner.set(false);

    });

  },

  'click .js-match-approve': function ( event, template ) {
    event.preventDefault();
    let self = this;
    let doc = template.data.document;
    let matchId = self._id;
    // open modal
    template.$('#SimilarMatchPatchModal-' + matchId).modal();

  },

  'click .js-match-child': function ( event, template ) {
    event.preventDefault();
    let self = this;
    let doc = template.data.document;
    approveMatch.call(
      {
        origin: doc.simple,
        match: self.simple,
        collection: 'organizations',
        type: 'child'
      },
      function(error, result){
        if (error) console.log(error);

        template.similar.set(result);
    });

  },

  'click .js-match-parent': function ( event, template ) {
    event.preventDefault();
    let self = this;
    let doc = template.data.document;
    approveMatch.call(
      {
        origin: doc.simple,
        match: self.simple,
        collection: 'organizations',
        type: 'parent'
      },
      function(error, result){
        if (error) console.log(error);

        template.similar.set(result);
    });

  }

});

Template.SimilarMatchPatchModal.onCreated(function() {
  let self = this;
  self.patch = new ReactiveVar(null);
  self.arrays = new ReactiveVar(null);
  let doc = Template.parentData(5).document;
  let simple = self.data.simple;
  // TODO matching algo should check against previously approved,
  // parents and children and set an attribute to be used in the interface
  getOrg.call({
    simple: simple
  }, ( error, result ) => {
      if ( error ) console.log(error);

      self.arrays.set( pick(result, DATA_ARRAYS) );
      let m = merge.recursive(true, doc, result);
      //console.log(m);
      let patch = compare(omit(doc, IGNORED_PATHS), omit(m, IGNORED_PATHS))
      .filter((x)=>{
        // RULES
        // 1. don't remove anything
        // 2. somethings should not be edited here
        return ( x.op !== 'remove' )
        //return ( x.op !== 'remove' && IGNORED_PATHS.indexOf(x.path) < 0 )
      })
      //.map((x)=>{
      //  // 3. array itemes should not replace but get added
      //  if ( x.op === 'replace' && DATA_ARRAYS.indexOf(x.path.split('/')[1]) > -1 ) {
      //    x.op = 'add';
      //  }
      //  return x;
      //});
      //console.log(patch);
      //console.log(diff(doc, m));
      self.patch.set(patch);
    });
});

Template.SimilarMatchPatchModal.events({

  'click .js-hunk-approve': function(event, template) {
    event.preventDefault();
    let mergeFrom = template.data;
    let mergeTo = Template.parentData(5).document;
    let patch = template.patch.get();
    let arrays = template.arrays.get();
    let data = template.$(event.currentTarget).data();
    let hunk = patch[data.hunkIndex];
    if ( data.rel ) {
      console.log(data.rel);
      let rel = snakeCase(data.rel);
      let object = arrays[rel][data.hunkIndex];
      addRelationship(object, mergeTo._id, rel);
      arrays[rel].splice(data.hunkIndex, 1);
      template.arrays.set(arrays)
    }
    if ( hunk.op === "add" ) {
      addHunk(hunk, mergeTo._id, mergeFrom.simple )
      patch.splice(data.hunkIndex, 1)
      template.patch.set(patch)
    }

    if ( hunk.op === "replace" ) {
      replaceHunk(hunk, mergeTo._id, mergeFrom.simple )
      patch.splice(data.hunkIndex, 1)
      template.patch.set(patch)
    }

    //console.log(patch);
    if ( patch.length < 1 ) {
      orgRemove.call({simple: mergeFrom.simple}, (error, result)=>{
        if (error) throw error;

        console.log(result);
        $('#SimilarMatchPatchModal' + mergeFrom._id).modal('hide');
        //similarOrgs.call({
        //  simple: simple
        //}, function(error, result){
        //    if (error) console.log(error);

        //    self.ready.set(true);
        //    self.similar.set(result);
        //});
      })
    }
  },

  'click .js-hunk-discard': function(event, template) {
    event.preventDefault();
    let self = this;
    let data = template.$(event.currentTarget).data();
    if ( data.rel ) {
      console.log(data.rel);
      let arrays = template.arrays.get();
      let rel = snakeCase(data.rel);
      arrays[rel].splice(data.hunkIndex, 1);
      template.arrays.set(arrays)
    }
    else {
      let patch = template.patch.get();
      patch.splice(data.hunkIndex, 1)
      template.patch.set(patch)
    }

  },

  'click button.js-confirm-merge': function(event, template) {
    event.preventDefault();
    let mergeFrom = template.data;
    let mergeTo = Template.parentData(5).document;
    let patch = template.patch.get();
    let arrays = template.arrays.get();
    let p = patch.map((hunk)=>{
      let path = hunk.path.split('/');
      let path_base = path[1];
      if ( path_base === 'contract_count' ){
        hunk.value = mergeTo.contract_count + hunk.value;
      }
      return hunk;
    })
    applyPatch(p, arrays, mergeTo._id, mergeFrom.simple);
    //if (!isEmpty(arrays)) {
    //  addRelationships(arrays, mergeTo._id, mergeFrom.simple)
    //}
  }

})

Template.SimilarMatchPatchModal.helpers({

  patch: function(){
    return Template.instance().patch.get();
  },

  rel_keys: function(){
    let arrays = Template.instance().arrays.get();
    return keys(arrays);
  },

  arrays: function() {
    return Template.instance().arrays.get();
  },
  simple: function(){
    return Template.instance().data.simple;
  },

  title: function(){
    return Template.parentData(5).document.simple;
  }

});
