import { faculties } from '../../constants/faculties';
import { useState } from 'react';
import FormScreen, { Action } from '../../components/common/FormScreen';
import useAuth from '../../hooks/useAuth';
const fields = [{key:'name',label:'Full name'},{key:'email',label:'University email',readOnly:true},
  {key:'university_id',label:'University ID',readOnly:true},{key:'account_type',label:'Account type',readOnly:true},
  {key:'faculty',label:'Department',options:faculties,dropdown:true},{key:'phone',label:'Phone',maxLength:32}];
export default function ProfileScreen({ navigation }) {
  const auth = useAuth();
  const [values,setValues] = useState(auth.user || {});
  const [message,setMessage] = useState('');
  async function save() { setMessage('');try { await auth.updateProfile(values);setMessage('Profile saved.'); } catch {} }
  return <FormScreen scrollForm fieldErrors={auth.fieldErrors} title="Profile" fields={fields} values={values} error={auth.error} message={message} busy={auth.loading}
    onChange={(key,value) => setValues(old => ({...old,[key]:value}))}>
    <Action title={auth.loading ? 'Saving...' : 'Save Profile'} disabled={auth.loading} onPress={save} />
    <Action variant="secondary" title="Saved Delivery Locations" onPress={() => navigation.navigate('SavedLocations')} />
    <Action variant="secondary" title="Wallet Preview" onPress={() => navigation.navigate('Wallet')} />
    <Action variant="text" title="Log Out" disabled={auth.loading} onPress={auth.logout} />
  </FormScreen>;
}
