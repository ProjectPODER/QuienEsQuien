import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  name: {
    type: String,
    label: "Nombre",
    max: 50
  },
  subject: {
    type: String,
    label: "Asunto",
    optional: true,
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: "Correo electrónico"
  },
  message: {
    type: String,
    label: "Mensaje",
    max: 1000
  },
  antispam: {
    type: String,
    optional: true,
  },
});
