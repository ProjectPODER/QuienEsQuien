/* eslint meteor/no-session: 0 */
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { ReactiveTabs } from 'meteor/templates:tabs';
import { Session } from 'meteor/session';

ReactiveTabs.createInterface({
  template: 'dynamicTabs',
  onChange(slug) {
    Session.set('activeTab', slug);
    const current = FlowRouter.current();
    const hash = current.context.hash;
    if (hash !== slug) {
      FlowRouter.go(`${current.path}#${slug}`);
    }
  },
});
