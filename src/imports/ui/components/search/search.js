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
      // id: 'search-home',
      class: 'easy-search-input landing-search-inputtext',
      placeholder: `${i18n.__('Search')} ...`
    };
  },
  first(array) {
    return array[0];
  },
   searchCount: () => {
    // index instanceof EasySearch.index
    let dict = indexes.getComponentDict(firstOption)

    // get the total count of search results, useful when displaying additional information
    return dict.get('count')
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
    if (event.keyCode === 13) {
       event.preventDefault();
       let url =  template.$('ul.suggestions li a').first().attr("href");

       if (url)
        window.location.href = url;
       else {
        //TODO: Explicarle al usuario que no lo podemos llevar a ningun lado hasta que no haya ningún resultado.
       }
    }
  },
});



