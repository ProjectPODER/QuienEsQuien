import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  name: {
    type: String,
    label: "Your name",
    max: 50
  },
  subject: {
    type: String,
    label: "Subject",
    optional: true,
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: "E-mail address"
  },
  message: {
    type: String,
    label: "Message",
    max: 1000
  },
  antispam: {
    type: String,
    optional: true,
  },
});
