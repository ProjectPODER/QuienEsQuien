import { $ } from 'meteor/jquery';
import { assert } from 'chai';  // Using Assert style
import withRenderedTemplate from '../../test-helpers.js';
import { counter } from '../../../api/stats/methods.js';

if (Meteor.isClient) {
  import './home.js';
  import '../../components/nav/nav.js';

  describe('Home', function () {
    beforeEach(function () {
      Template.registerHelper('_', key => key);
    });

    //afterEach(function () {
    //  Template.deregisterHelper('_');
    //});

    it('Should be titled "Quién es Quién Wiki"', function () {
      withRenderedTemplate('Home', {}, el => {
        assert.strictEqual($(el).find('.page-title').text(), "Quién es Quién Wiki")
      });
    });

    it('Should have description "Base de datos sobre las élites y las estructuras..."', function () {
      withRenderedTemplate('Home', {}, el => {
        assert.strictEqual($(el).find('.page-description').text(),
          "Base de datos sobre las élites y las estructuras de poder")
      });
    });

  });
}
