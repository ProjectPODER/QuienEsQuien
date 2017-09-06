import { $ } from 'meteor/jquery';
import { assert } from 'chai';
import withRenderedTemplate from '../../test-helpers.js';

if (Meteor.isClient) {
  import './dropzone.js'

  describe('Dropzone', function () {
    it('Has a Cloud Icon', function () {
      withRenderedTemplate('dropzone', {}, el => {
        assert.equal($(el).find('i').hasClass('fa'), true)
        assert.equal($(el).find('i').hasClass('fa-cloud-upload'), true)
      });
    });
  });
}
