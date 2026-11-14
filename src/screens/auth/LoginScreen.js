import { useState } from 'react';
import FormScreen, { Action } from '../../components/common/FormScreen';
import useAuth from '../../hooks/useAuth';
export default function LoginScreen({ navigation, route }) {
  const auth = useAuth();
  const [values, setValues] = useState({email:'',password:''});
  return <FormScreen scrollForm fieldErrors={auth.fieldErrors} title="Login" fields={[{key:'email',label:'University email'},{key:'password',label:'Password',secret:true}]}
    values={values} onChange={(key,value) => setValues(old => ({...old,[key]:value}))} error={auth.error}
    busy={auth.loading} message={route.params?.registered ? 'Account created. Please sign in.' : ''}>
    <Action title={auth.loading ? 'Signing in...' : 'Sign In'} disabled={auth.loading} onPress={() => auth.login(values.email,values.password).catch(() => {})} />
    <Action variant="text" title="Create Account" disabled={auth.loading} onPress={() => {auth.clearError();navigation.navigate('SignUp');}} />
  </FormScreen>;
}
