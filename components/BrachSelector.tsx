import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';

type Props = {
  data: any;
  value?: any;
  setValue: (value: Invoice) => void;
};

const DropdownComponent = ({ value, setValue, data }: Props) => {
  const [isFocus, setIsFocus] = useState(false);

  const renderLabel = () => {
    if (value || isFocus) {
      return <Text style={[styles.label, isFocus && { color: '#D32F2F' }]}>Select Branch</Text>;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* {renderLabel()} */}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: '#D32F2F' }]}
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
        value={value?.branch_code}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setValue({ ...value, branch_id: item?.value });
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? '#D32F2F' : '#FFB03B'}
            name="Safety"
            size={20}
          />
        )}
      />
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    // Light background inspired by the logo's border color
  },
  dropdown: {
    width: '100%',
    height: 50,
    borderColor: '#D32F2F', // Red color similar to the background of the logo
    borderWidth: 1,
    borderRadius: 25, // Rounded corners inspired by the circular design of the logo
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: '#FFF1D7',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#D32F2F', // Red color similar to the text in the logo
    fontWeight: 'bold',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#FFB03B', // Light yellow color to match the outer ring of the logo
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#D32F2F', // Red color similar to the text in the logo
  },
  iconStyle: {
    width: 20,
    height: 20,
    tintColor: '#D32F2F', // Red color similar to the logo
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: '#D32F2F', // Red color similar to the logo
  },
});
