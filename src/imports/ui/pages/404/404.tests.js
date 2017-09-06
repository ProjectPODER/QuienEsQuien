import { $ } from 'meteor/jquery';
import { assert } from 'chai';
import withRenderedTemplate from '../../test-helpers.js';

if (Meteor.isClient) {
  import './404.js'

  describe('Page not found', function () {
    beforeEach(function () {
      Template.registerHelper('_', key => key);
    });

    it('Says \"Page Not Found\" ', function () {
      withRenderedTemplate('pageNotFound', {}, el => {
        assert.equal($(el).find('#not-found').text(), 'Page not Found.')
      });
    });
    it('Has a spinner', function () {
      withRenderedTemplate('pageNotFound', {}, el => {
        assert.equal($(el).find('.spin i').hasClass('fa-spinner'), true)
      });
    });
  });
}
