export function validateBySchema(object, schema) {
  const context = schema.newContext('testContext');
  // schema.clean(object);
  const isValid = context.validate(object);
  if (isValid) return object;

  const errors = context.invalidKeys().map(error =>
     ({
       name: error.name,
       type: error.type,
       details: {
         value: error.value,
       },
     }),
  );

  const message = '(Validation Error)' + errors.map(e =>
    `\n\t${e.name} : ${e.type} (${e.details.value})`,
  ).join();

  throw new Package['mdg:validation-error'].ValidationError(errors, message);
}
