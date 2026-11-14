import { faculties } from '../../constants/faculties';
import { useState } from 'react';
import FormScreen, { Action } from '../../components/common/FormScreen';
import useAuth from '../../hooks/useAuth';
import { registrationErrors, revalidateRegistrationFields } from '../../utils/validation';
const fields = [{key:'name',label:'Full name'},{key:'email',label:'University email'},
  {key:'university_id',label:'University ID',maxLength:32},{key:'faculty',label:'Department',options:faculties,dropdown:true},{key:'account_type',label:'Account type',options:['student','staff']},
  {key:'phone',label:'Phone number',maxLength:32},{key:'password',label:'Password (8 characters minimum)',secret:true},
  {key:'passwordConfirm',label:'Confirm password',secret:true}];
export default function SignUpScreen({ navigation }) {
  const auth = useAuth();
  const [values,setValues] = useState({account_type:'student'});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitAttempt, setSubmitAttempt] = useState(0);
  function change(key, value) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (submitAttempt) setErrors(old => revalidateRegistrationFields(old, next, key));
  }
  async function submit() {
    setSubmitAttempt(count => count + 1);
    setFormError('');
    const invalid = registrationErrors(values);
    setErrors(invalid);
    if (Object.keys(invalid).length) return;
    try { await auth.register(values); navigation.popTo('Login',{registered:true}); }
    catch (error) {
      setErrors(error.fieldErrors || {});
      if (!Object.keys(error.fieldErrors || {}).length) setFormError(error.message);
    }
  }
  return <FormScreen scrollForm fieldErrors={errors} errorAttempt={submitAttempt} title="Sign Up" fields={fields} values={values} busy={auth.loading} error={formError}
    onChange={change}>
    <Action title={auth.loading ? 'Creating account...' : 'Create Account'} disabled={auth.loading} onPress={submit} />
    <Action variant="text" title="Already have an account? Log In" disabled={auth.loading} onPress={() => {auth.clearError();navigation.popTo('Login');}} />
  </FormScreen>;
}
