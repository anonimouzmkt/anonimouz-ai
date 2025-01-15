import { createContext, useContext } from "react";

interface SelectedUserContextType {
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
}

export const SelectedUserContext = createContext<SelectedUserContextType>({
  selectedUserId: "",
  setSelectedUserId: () => {},
});

export const useSelectedUser = () => useContext(SelectedUserContext);