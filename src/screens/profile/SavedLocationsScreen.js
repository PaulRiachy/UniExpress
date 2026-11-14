import { colors } from '../../constants/theme';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import FormScreen, { Action } from '../../components/common/FormScreen';
import * as delivery from '../../services/deliveryService';
export default function SavedLocationsScreen() {
  const [locations,setLocations] = useState([]);
  const [buildings,setBuildings] = useState([]);
  const [values,setValues] = useState({label:'',room:'',building:''});
  const [editing,setEditing] = useState(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const mounted = useRef(true);
  const inFlight = useRef(false);
  async function run(action) {
    if (inFlight.current) return;
    inFlight.current = true;setBusy(true);setError('');
    try { await action(); }
    catch(e) { if (mounted.current) setError(e.message); }
    finally {inFlight.current=false;if(mounted.current)setBusy(false);}
  }
  async function load() {
    const [saved,available] = await Promise.all([delivery.getSavedLocations(),delivery.getBuildings()]);
    if (mounted.current) {setLocations(saved);setBuildings(available);}
  }
  useEffect(() => { mounted.current=true;run(load);return () => {mounted.current=false;}; },[]);
  function reset() {setEditing(null);setValues({label:'',room:'',building:''});}
  async function save() {
    await delivery.saveLocation(values,editing);
    if(mounted.current) reset();
    await load();
  }
  function remove(item) {
    Alert.alert('Delete location?',item.label,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:() => run(async () => {await delivery.deleteLocation(item.id);if(mounted.current && editing===item.id)reset();await load();})}]);
  }
  return <FormScreen title="Saved Delivery Locations" fields={[{key:'label',label:'Label',maxLength:80},{key:'room',label:'Room number',maxLength:32}]}
    values={values} busy={busy} error={error} message={busy ? 'Loading / saving...' : ''}
    onChange={(key,value) => setValues(old => ({...old,[key]:value}))}>
    <Text style={{fontSize:16,fontWeight:'600',color:colors.text}}>Choose a building</Text>
    <FlatList horizontal data={buildings} keyExtractor={item => item.id} ListEmptyComponent={<Text>No available buildings. Retry loading.</Text>}
      renderItem={({item}) => <View style={{marginRight:12}}><Action disabled={busy} title={item.code + (item.id===values.building ? ' (selected)' : '')}
        onPress={() => setValues(old => ({...old,building:item.id}))} /></View>} />
    <Action title={editing ? 'Save Changes' : 'Add Location'} disabled={busy} onPress={() => run(save)} />
    {!!editing && <Action title="Cancel Editing" disabled={busy} onPress={reset} />}
    <Action variant="secondary" title="Refresh Locations" disabled={busy} onPress={() => run(load)} />
    <FlatList data={locations} scrollEnabled={false} keyExtractor={item => item.id}
      ListEmptyComponent={<Text>{busy ? 'Loading locations...' : 'No saved locations yet.'}</Text>}
      renderItem={({item}) => <View style={{padding:16,marginVertical:8,gap:8,backgroundColor:colors.pale,borderRadius:8}}>
        <Text>{item.label} / {item.expand?.building?.code || 'Building'} / Room {item.room}</Text>
        <Action variant="secondary" title={'Edit ' + item.label} disabled={busy} onPress={() => {setEditing(item.id);setValues({label:item.label,room:item.room,building:item.building});}} />
        <Action variant="text" title={'Delete ' + item.label} disabled={busy} onPress={() => remove(item)} />
      </View>} />
  </FormScreen>;
}
