import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";

const useMenu = () => {
  const { top } = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return { top, visible, setVisible, openMenu, closeMenu };
};

export default useMenu;

const useModel = ()=>{
  
}
