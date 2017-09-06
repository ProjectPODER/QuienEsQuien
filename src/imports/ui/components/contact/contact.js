import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './contact.html';
import { contactFormSchema } from '../../../api/contact.js';

Template.contactForm.helpers({
  contactFormSchema: function() {
    return contactFormSchema;
  }
});

AutoForm.hooks({
  contactForm: {
    onSuccess: function(formType, result) {
        FlowRouter.go('/contact/success');
    }
  }
});
