import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';

const data = [
  { value: 'HO01', label: 'Head Office' },
  { value: 'MA01', label: 'MUHAYIL' },
  { value: 'MD01', label: 'MADINA DEFAA' },
  { value: 'MK01', label: 'SHARAYA' },
  { value: 'MK02', label: 'RUSAIFA' },
  { value: 'MK03', label: 'Nawaria' },
  { value: 'PR01', label: 'FACTORY TAIF' },
  { value: 'RY01', label: 'KITCHEN PARK WADI' },
  { value: 'RY02', label: 'RAWABI' },
  { value: 'RY03', label: 'Suwaidi' },
  { value: 'TF01', label: 'SITHEEN' },
  { value: 'TF02', label: 'TELEVISION' },
  { value: 'TF03', label: 'GUMRIYA' },
  { value: 'TF04', label: 'OKAZ' },
  { value: 'TF05', label: 'AL QAIM' },
  { value: 'TF06', label: 'JUNOOB' },
  { value: 'TF07', label: 'HAWIYYAH' },
  { value: 'TF08', label: 'DHAHAS' },
  { value: 'TF09', label: 'SANAYA' },
  { value: 'TF10', label: 'SHUTBA' },
  { value: 'TF11', label: 'HALAGA' },
  { value: 'TF12', label: 'QARWA' },
  { value: 'TF13', label: 'HADA' },
  { value: 'WH01', label: 'WAREHOUSE' },
  { value: 'YB01', label: 'YANBU HAWRA' },
  { value: 'YB02', label: 'YANBU BALAD' },
  { value: 'YB03', label: 'YANBU MASHAD' },
  { value: 'YB04', label: 'YANBU BANDAR' },
  { value: 'YB05', label: 'YANBU KING KHALID' },
];

const DropdownComponent = () => {
  const [value, setValue] = useState<string | null>(null);
  const [isFocus, setIsFocus] = useState(false);

  const renderLabel = () => {
    if (value || isFocus) {
      return <Text style={[styles.label, isFocus && { color: 'blue' }]}>Select Branch</Text>;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {renderLabel()}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Select Branch' : '...'}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setValue(item?.value);
          setIsFocus(false);
        }}
        // renderLeftIcon={() => (
        //   <AntDesign
        //     style={styles.icon}
        //     color={isFocus ? 'blue' : 'black'}
        //     name="Safety"
        //     size={20}
        //   />
        // )}
      />
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
