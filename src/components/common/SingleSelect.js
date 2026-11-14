import { FlatList, Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';
export default function SingleSelect({ label, options, value, onChange, disabled, error }) {
  return <FlatList data={options} scrollEnabled={false} keyExtractor={item => item}
    ListHeaderComponent={<Text style={styles.label}>{label}</Text>}
    ListFooterComponent={error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    renderItem={({item}) => <Pressable accessibilityRole="radio" accessibilityLabel={item}
      accessibilityState={{checked:value===item,disabled:!!disabled}} disabled={disabled} onPress={() => onChange(item)}
      style={[styles.option,value===item && styles.selected,error && {borderColor:colors.error},disabled && {opacity:0.6}]}>
      <Text style={[styles.text,value===item && {color:colors.primaryDark,fontWeight:'700'}]}>{value===item ? '●' : '○'}  {item}</Text>
    </Pressable>} />;
}
const styles=StyleSheet.create({label:{color:colors.text,fontWeight:'600',fontSize:15,marginBottom:8},option:{minHeight:48,borderWidth:1,borderColor:colors.gray,borderRadius:8,padding:12,marginBottom:8,justifyContent:'center'},selected:{borderColor:colors.primary,backgroundColor:colors.pale},text:{fontSize:16,color:colors.text},error:{color:colors.error,marginBottom:8}});
