import { createContext, useContext, useState } from "react";

interface SelectedUserContextType {
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
}

export const SelectedUserContext = createContext<SelectedUserContextType>({
  selectedUserId: "",
  setSelectedUserId: () => {},
});

export const useSelectedUser = () => {
  const context = useContext(SelectedUserContext);
  if (!context) {
    throw new Error("useSelectedUser must be used within a SelectedUserProvider");
  }
  return context;
};

export const SelectedUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedUserId, setSelectedUserId] = useState("");

  return (
    <SelectedUserContext.Provider value={{ selectedUserId, setSelectedUserId }}>
      {children}
    </SelectedUserContext.Provider>
  );
};