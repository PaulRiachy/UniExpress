const assert = require('node:assert/strict');
(async () => {
  const { serviceRequest } = await import('../../src/services/serviceRequest.js');
  const cases = [
    [{status:0}, /Connection failed/],
    [new Error('internal error'), /Something went wrong/],
    [{status:500}, /server could not/],
    [{status:403}, /not permitted/],
    [{status:400,response:{data:{email:{code:'validation_not_unique'}}}}, /highlighted/],
  ];
  for(const [cause,message] of cases) await assert.rejects(serviceRequest(() => {throw cause;}),e => message.test(e.message));
  for(const field of ['email','university_id']) {
    await assert.rejects(serviceRequest(() => {throw {status:400,response:{data:{[field]:{code:'validation_not_unique'}}}};}),e => /already in use/.test(e.fieldErrors[field]));
  }
  const {registrationErrors} = await import('../../src/utils/validation.js');
  assert.ok(registrationErrors({}).faculty);
  const {revalidateRegistrationFields} = await import('../../src/utils/validation.js');
  const emptyErrors=registrationErrors({});
  assert.equal(Object.keys(emptyErrors).length,8);
  assert.ok(emptyErrors.password && emptyErrors.passwordConfirm && emptyErrors.faculty);
  const previous={email:'Already registered',university_id:'Already used',passwordConfirm:'Mismatch'};
  const edited=revalidateRegistrationFields(previous,{email:'valid@ua.edu.lb'},'email');
  assert.equal(edited.email,undefined);
  assert.equal(edited.university_id,'Already used');
  const dependent=revalidateRegistrationFields({password:'Short',passwordConfirm:'Mismatch'}, {password:'valid-password',passwordConfirm:'valid-password'},'password');
  assert.deepEqual(dependent,{});
  await assert.rejects(serviceRequest(() => {throw {status:400,response:{data:{email:{code:'validation_not_unique'},phone:{code:'validation_required'}}}};}),error => !!error.fieldErrors.email && !!error.fieldErrors.phone);
  console.log('PASS: all empty registration fields fail together; edited/dependent errors revalidate while unrelated server errors remain.');
  console.log('PASS: network/server/programming errors remain distinct; duplicate errors and required faculty are field-specific.');
})().catch(e => {console.error(e.message);process.exitCode=1;});
