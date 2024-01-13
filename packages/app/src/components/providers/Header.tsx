import { Accessor, JSX, Setter, createContext, createSignal, useContext } from "solid-js";
import { cn } from "../../utils/cn";

export const HeaderContext = createContext({
  visible: () => true,
  setVisible: () => {},
} as {
  visible: Accessor<boolean>;
  setVisible: Setter<boolean>;
});

export const Header = (props: { children: JSX.Element; header: JSX.Element }) => {
  const [visible, setVisible] = createSignal(true);
  return (
    <HeaderContext.Provider
      value={{
        visible,
        setVisible,
      }}
    >
      <nav class="flex items-center justify-between flex-wrap bg-white/[0.01] dark:bg-black/[0.01] border-b border-neutral-300 dark:border-neutral-900 w-screen py-2">
        {props.header}
      </nav>
      {props.children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  return useContext(HeaderContext);
};
