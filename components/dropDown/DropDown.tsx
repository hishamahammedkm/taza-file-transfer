import { FlatList, SafeAreaView, View } from 'react-native';
import React from 'react';
import { Checkbox, Divider, Modal, Portal, Searchbar, Text, TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
// import { Modal, Portal, Text, Button, PaperProvider } from 'react-native-paper';

import ListItem from './ListItem';

const DropDown = () => {
  // let items = [
  //   { value: 'value1', id: '1', label: 'Kg' },
  //   { value: 'value2', id: '2', label: 'Mtr' },
  //   { value: 'value3', id: '3', label: 'Feet' },
  //   { value: 'value4', id: '4', label: 'Mm' },
  //   { value: 'value5', id: '5', label: 'Ltr' },
  // ];
  const items: MenuItem[] = [
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

  const [data, setData] = React.useState<MenuItem[] | null>(items);

  const [unitOf, setUnitOf] = React.useState<MenuItem | null>(null);
  console.log('unitOf--', unitOf);

  const [visible, setVisible] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: 'white', padding: 20};
  const handleSearch = (text: string) => {
    setQuery(text);
    if (text) {
      let newItems = items.filter((item) => item.label.toLowerCase().includes(text.toLowerCase()));

      setData(newItems);
    } else {
      setData(items);
    }
  };
  return (
    <SafeAreaView>
      <TextInput
        placeholder="Branch"
        value={unitOf?.label}
        onFocus={showModal}
        // onChangeText={(text) => {
        //   setUnitOf({ value: text.toUpperCase(), label: text });
        // }}
        right={
          <TextInput.Icon
            icon={({ color, size }) => (
              <MaterialIcons onPress={showModal} name="arrow-drop-down" size={size} color={color} />
            )}
          />
        }
      />

      <Portal
      
      >
        <Modal
          visible={visible}
          onDismiss={hideModal}
          overlayAccessibilityLabel="kl"
          style={
            {
              maxHeight:100
            }
          }
          contentContainerStyle={{
            backgroundColor: 'white', padding: 20,

          }}>
          <SafeAreaView>
            <View className="flex gap-5">
              <View>
                <Text variant="headlineSmall">Select Branch</Text>
              </View>
              <Divider />

              <View>
                <Searchbar placeholder="Search" onChangeText={handleSearch} value={query} />
              </View>
              <FlatList
                data={data}
                renderItem={({ item }) => (
                  <ListItem
                    value={unitOf}
                    data={item}
                    checked={checked}
                    setChecked={setChecked}
                    setValue={setUnitOf}
                    hideModal={hideModal}
                  />
                )}
                keyExtractor={(item) => item.value}
              />
              {/* <View className="flex flex-row items-center justify-end gap-5">
              <Button mode="outlined" onPress={hideModal}>
                Close
              </Button>
              <Button mode="outlined" onPress={hideModal}>
                Done
              </Button>
            </View> */}
            </View>
          </SafeAreaView>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

export default DropDown;
