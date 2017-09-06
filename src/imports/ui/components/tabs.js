import i18n from 'meteor/universe:i18n';

export const profile_tabs = {
  public: [
    { name: i18n.__('view'), slug: 'view' },
    { name: i18n.__('read'), slug: 'read' },
  ],
  admin: [
    { name: i18n.__('edit'), slug: 'edit' },
    { name: i18n.__('similar'), slug: 'similar' }
  ]
}
