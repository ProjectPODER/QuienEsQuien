import i18n from 'meteor/universe:i18n';
import './search.html';
import '../spin/spinner.html';
import { PersonsIndex } from '../../../api/persons/persons';
import { OrgsIndex } from '../../../api/organizations/organizations';

Template.searchForm.helpers({
  indexes() {
    return [PersonsIndex, OrgsIndex];
  },
  persons() {
    return PersonsIndex;
  },
  orgs() {
    return OrgsIndex;
  },
  inputAttributes() {
    return {
      class: 'easy-search-input form-control',
      placeholder: `${i18n.__('Search')} ...`
    };
  },
  first(array) {
    return array[0];
  },
});

Template.searchForm.events({
  'click .js-org-link, click .js-person-link': function (event, template) {
    template.$('.easy-search-input').val('');
    template.$('ul.suggestions').empty();
  },

  'keypress input, keydown input': function (event, template) {
    if (event.keyCode === 27) {
      template.$('.easy-search-input').val('');
    }
  },
});
