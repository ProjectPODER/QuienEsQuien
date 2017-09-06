import './api.html';

 Template.api_docs.helpers({
   host: function() {
     return Meteor.absoluteUrl()
   }
 })
