import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { AutoForm } from 'meteor/aldeed:autoform';
import './contact.html';
import contactFormSchema from '../../../api/contact.js';

Template.contactForm.helpers({
  contactFormSchema: function() {
    return contactFormSchema;
  }
});

AutoForm.hooks({
  contactForm: {
    onSuccess: function() {
      FlowRouter.go('/contact/success');
    }
  }
});

Template.contactForm.onCreated(function() {
  $(document).ready(function () {    
    $('nav').addClass("fixed-nav");
  });
}); 
