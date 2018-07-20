import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import moment from 'moment';
import 'moment/locale/es'
import i18n from 'meteor/universe:i18n';
import { ContractsOCDS } from '../../../api/contracts_ocds/contracts_ocds.js';
import { Orgs } from '../../../api/organizations/organizations.js';
import { Images, Thumbnails } from '../../../api/images/images.js';
import {
  simpleName,
} from '../../../api/lib';
import '../../components/upload/upload.js';
import './contracts.html';
import '../../helpers';
import '../../components/subscribe/subscribe.js';


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
    const supplier = window.queryParams.supplier.replace(/"/g,'');
      const contract = ContractsOCDS.find(
        { ocid: id }
      )
      contract.forEach((contract) => { selectContract(contract,supplier)})
      var handle = contractSub.subscribe('contract_ocds', id, {
        onReady: function() {
          const contract = ContractsOCDS.find({ocid: id });
          if (contract.fetch().length==0) {
            console.log("ERROR: No existe el contrato",id);
          }
          contract.forEach((contract) => { selectContract(contract,supplier)})
        }
      })

      function selectContract(contract,supplier) {
        console.log("selectContract",simpleName(contract.contracts[0].suppliers),supplier)
        if (simpleName(contract.contracts[0].suppliers) == supplier) {
          self.contract.set('document', contract)
          self.ready.set(true);
        }
      }

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
  $('[data-toggle="tooltip"]').tooltip({placement: 'right'});
  $('.right-menu-contracts').affix({offset: {top: 280, bottom:900} });
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

Template.contractView.helpers({
  simpleName: function(params) {
    return simpleName(params)
  },
  getField: function(params) {
    if (params.hash.object && params.hash.object[0] && params.hash.field)
    {
      try {

        if (params.hash.object[0][params.hash.field]) {

          console.log(params.hash.field,params.hash.object[0][params.hash.field]);
          return params.hash.object[0][params.hash.field].toString();
        }
        else {
          console.log(params.hash.field,"---");
          return "---"
        }
      }
      catch(e) {
        console.log(e,"object",params.hash.object,"field",params.hash.field,"value");
        return "--"
      }

    }
    return "-"
  }
})
