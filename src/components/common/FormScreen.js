import { useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { colors, universityName } from '../../constants/theme';
import SingleSelect from './SingleSelect';
import DropdownSelect from './DropdownSelect';
export default function FormScreen({ title, fields=[],values={},onChange,children,error,fieldErrors={},message,busy,scrollForm=false,errorAttempt=0 }) {
  const insets=useSafeAreaInsets();
  const headerHeight=useHeaderHeight();
  const scroll=useRef(null), inputs=useRef({}), positions=useRef({}), focused=useRef(null);
  const [focus,setFocus]=useState(null);
  function reveal(key) {if(scrollForm && positions.current[key] !== undefined) scroll.current?.scrollTo({y:Math.max(0,positions.current[key]-16),animated:true});}
  useEffect(() => {const sub=Keyboard.addListener('keyboardDidShow',() => reveal(focused.current));return () => sub.remove();},[scrollForm]);
  useEffect(() => {
    if (!errorAttempt || busy) return;
    const key = fields.find(item => fieldErrors[item.key])?.key;
    if (key) reveal(key);
  }, [errorAttempt, busy]);
  const introduction=<View style={styles.intro}><Text style={styles.brand}>UniExpress</Text><Text style={styles.identity}>{universityName}</Text>
    <Text accessibilityRole="header" style={styles.title}>{title}</Text><Text style={styles.subtitle}>Your campus, closer.</Text>
    {!!message && <Text style={styles.message}>{message}</Text>}</View>;
  function field(item,index) {
    if(item.options) {
      const Selector = item.dropdown ? DropdownSelect : SingleSelect;
      return <View key={item.key} style={styles.field} onLayout={e => {positions.current[item.key]=e.nativeEvent.layout.y;}}>
        <Selector label={item.label} options={item.options} value={values[item.key]} onChange={value => onChange(item.key,value)} disabled={busy} error={fieldErrors[item.key]} />
      </View>;
    }
    const next=fields.slice(index+1).find(f => !f.readOnly && !f.options);
    const neutral=item.secret || ['email','university_id','phone'].includes(item.key);
    return <View key={item.key} style={styles.field} onLayout={e => {positions.current[item.key]=e.nativeEvent.layout.y;}}>
      <Text style={styles.label}>{item.label}</Text><TextInput ref={node => {inputs.current[item.key]=node;}}
        accessibilityLabel={item.label} style={[styles.input,focus===item.key && styles.focused,item.readOnly && styles.readOnly,fieldErrors[item.key] && styles.invalid]}
        editable={!busy && !item.readOnly} value={values[item.key] || ''} onChangeText={text => onChange(item.key,text)}
        onFocus={() => {focused.current=item.key;setFocus(item.key);reveal(item.key);}} onBlur={() => setFocus(null)}
        secureTextEntry={item.secret} autoCapitalize={neutral ? 'none' : 'words'} autoCorrect={!neutral}
        autoComplete={item.key==='email' ? 'email' : item.secret ? (title==='Sign Up' ? 'new-password' : 'current-password') : item.key==='name' ? 'name' : item.key==='phone' ? 'tel' : 'off'}
        keyboardType={item.key==='email' ? 'email-address' : item.key==='phone' ? 'phone-pad' : 'default'}
        returnKeyType={next ? 'next' : 'done'} submitBehavior="submit"
        onSubmitEditing={() => next ? inputs.current[next.key]?.focus() : Keyboard.dismiss()}
        maxLength={item.maxLength || (item.secret ? 128 : 120)} />
      {!!fieldErrors[item.key] && <Text accessibilityRole="alert" style={styles.error}>{fieldErrors[item.key]}</Text>}
    </View>;
  }
  const contentStyle={paddingTop:24,paddingLeft:24+insets.left,paddingRight:24+insets.right,paddingBottom:24+insets.bottom,flexGrow:1,width:'100%',maxWidth:560,alignSelf:'center'};
  const footer=<View style={styles.footer}>{!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}{children}</View>;
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS==='ios' ? 'padding' : 'height'} keyboardVerticalOffset={headerHeight}>
    {scrollForm ? <ScrollView ref={scroll} style={{flex:1}} contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled" onTouchEnd={event => {if(event.target===event.currentTarget) Keyboard.dismiss();}} keyboardDismissMode={Platform.OS==='ios' ? 'interactive' : 'on-drag'}>
      {introduction}{fields.map(field)}{footer}
    </ScrollView> : <FlatList keyboardShouldPersistTaps="handled" onTouchEnd={event => {if(event.target===event.currentTarget) Keyboard.dismiss();}} keyboardDismissMode="on-drag" data={fields} keyExtractor={item=>item.key} contentContainerStyle={contentStyle} ListHeaderComponent={introduction} renderItem={({item,index})=>field(item,index)} ListFooterComponent={footer} />}
  </KeyboardAvoidingView>;
}
export function Action({title,onPress,disabled,variant='primary'}) {
  return <Pressable accessibilityRole="button" accessibilityState={{disabled:!!disabled}} disabled={disabled} onPress={onPress}
    style={({pressed})=>[styles.button,variant!=='primary' && styles.secondary,variant==='text' && {borderWidth:0},pressed && {backgroundColor:variant==='primary' ? colors.primaryDark : colors.pale},disabled && styles.disabled]}>
    <Text style={[styles.buttonText,variant!=='primary' && {fontSize:16,fontWeight:'600',color:colors.primaryDark},disabled && {color:colors.muted}]}>{title}</Text>
  </Pressable>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:colors.white},intro:{marginBottom:24,alignItems:'center'},brand:{fontSize:24,fontWeight:'800',color:colors.primary},identity:{fontSize:14,lineHeight:22,color:colors.muted,marginTop:4,textAlign:'center',flexShrink:1},title:{fontSize:28,fontWeight:'700',color:colors.primary,marginTop:24,textAlign:'center'},subtitle:{fontSize:16,color:colors.muted,marginTop:8,textAlign:'center'},field:{marginBottom:16},label:{color:colors.text,fontWeight:'600',fontSize:15},input:{minHeight:48,borderWidth:1,borderColor:colors.border,borderRadius:8,padding:12,marginTop:8,color:colors.text,backgroundColor:colors.white,fontSize:16},focused:{borderColor:colors.primary,borderWidth:2},invalid:{borderColor:colors.error},readOnly:{backgroundColor:colors.pale,color:colors.muted},error:{color:colors.error,marginTop:8,fontSize:14,lineHeight:20},message:{color:colors.primaryDark,marginTop:16},footer:{gap:12},button:{minHeight:48,borderRadius:8,padding:14,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},secondary:{backgroundColor:colors.white,borderWidth:1,borderColor:colors.primary},disabled:{backgroundColor:'#ECEDEE',borderColor:colors.gray},buttonText:{fontSize:20,fontWeight:'700',color:colors.white,textAlign:'center'}});
