import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './404.html';

Template.pageNotFound.onRendered(function () {

  Meteor.setTimeout(function(){
    FlowRouter.go('/');
  }, 10000);

});
