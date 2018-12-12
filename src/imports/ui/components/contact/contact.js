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
    before: {
      method: function(doc) {
        console.log("doc",doc);
        this.result(doc);
      }
    },
    onSuccess: function() {
      FlowRouter.go('/contact/success');
    },
    onError: function(formType,error) {
      alert("No se envió: " + formType + " - " + error.message);
      console.error(error);
    }
  }
});
