import i18n from 'meteor/universe:i18n';
import SimpleSchema from 'simpl-schema';
import {
  accountsUIBootstrap3,
} from 'meteor/ian:accounts-ui-bootstrap-3';
import moment from 'moment';

function getUserLanguage() {
  lang = (
      navigator.languages && navigator.languages[0] ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      'es'
  );
  if (lang == "es-419")
    lang = "es"

  return lang;
}

Meteor.startup(() => {
  const lang = getUserLanguage();
  moment.locale(lang);
  i18n.setLocale(lang).then(() => {
    console.log('detected language:', lang); // eslint-disable-line no-console
  });
  accountsUIBootstrap3.setLanguage(lang);
  SimpleSchema.setDefaultMessages({
    messages: {
      en: i18n.getTranslations('SimpleSchema', 'en'),
      es: i18n.getTranslations('SimpleSchema', 'es'),
    },
  });
});
