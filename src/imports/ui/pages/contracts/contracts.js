import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import moment from 'moment';
import i18n from 'meteor/universe:i18n';
import { Contracts } from '../../../api/contracts/contracts.js';
import { Orgs } from '../../../api/organizations/organizations.js';
import { Images, Thumbnails } from '../../../api/images/images.js';
import '../../components/upload/upload.js';
import './contracts.html';
import '../../helpers';


const LIMIT = 1000;

contractSub = new SubsManager({
  cacheLimit: 50
});

// Template.contractView.onRendered(function() {
//   DocHead.setTitle('QuiénEsQuién.Wiki - ' + // Template.instance().data.contract.title)
// })

Template.showContractWrapper.onCreated(function() {

  const self = this;

  self.contract = new ReactiveDict();
  self.ready = new ReactiveVar();

  self.autorun(function() {
      const id = FlowRouter.getParam("_id");
      const contract = Contracts.findOne({ $or: [
        { ocid: id },
        { _id: id }
      ]});
      self.contract.set('document', contract);
      var handle = contractSub.subscribe('contract', id, {
        onReady: function() {
          const contract = Contracts.findOne({ $or: [
            { ocid: id },
            { _id: id }
          ]});
          self.contract.set('document', contract);
        }
      })
      self.ready.set(handle.ready());
  });
});

Template.showContractWrapper.helpers({
  ready: function() {
    return Template.instance().ready.get();
  },
  selectedContractDoc: function() {
    var revision = Template.instance().contract.get('revision');
    if (revision) {
      return revision;
    }
    var contract = Template.instance().contract.get('document');
    if (contract) {
      contract.collection = 'contracts';
      return contract
    } else {
      return null
    }
  },

  tabs: function() {
      return [
        {
          name: i18n.__('read'),
          slug: 'read'
        }
      ];

  },
  activeTab: function() {
    return Session.get('activeTab');
  }
});


Template.contractProfileImage.onCreated(function() {
  let self = this;

  self.ready = new ReactiveVar();
  var docId = FlowRouter.getParam('_id');

  self.autorun(() => {
    Meteor.subscribe('image', docId);
    let images = Images.find({orgId: docId}).count();
    if (images > 0) {
      let sub = Meteor.subscribe('thumbnail', docId);
      self.ready.set(sub.ready());
    }
  });
});

Template.contractProfileImage.helpers({
  ready: function() {
    return Template.instance().ready.get()
  },
  completed: function() {
    return Math.round(this.progress * 100);
  },
  image: function(orgId) {
    return Images.findOne({ orgId: orgId });
  },
  thumb: function() {
    return Thumbnails.findOne({originalId: this._id});
  }
});

Template.contractView.onRendered(function() {
  this.$('[data-toggle="tooltip"]').tooltip({placement: 'right'});
  $('.right-menu-contracts').affix({offset: {top: 280, bottom:850} }); 
  import("../../../../node_modules/jquery.easing/jquery.easing.js").then(() => {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 70)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });
  });
});


