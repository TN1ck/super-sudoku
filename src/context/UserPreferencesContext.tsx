import React, {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer} from "react";
import {localStorageUserPreferencesRepository, UserPreferences} from "src/lib/database/userPreferences";

type UserPreferencesAction = {type: "TOGGLE"; key: keyof UserPreferences};

function userPreferencesReducer(state: UserPreferences, action: UserPreferencesAction): UserPreferences {
  switch (action.type) {
    case "TOGGLE":
      return {
        ...state,
        [action.key]: !state[action.key],
      };
    default:
      return state;
  }
}

interface UserPreferencesContextType {
  state: UserPreferences;
  toggleShowHints: () => void;
  toggleShowOccurrences: () => void;
  toggleShowConflicts: () => void;
  toggleShowCircleMenu: () => void;
  toggleShowWrongEntries: () => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

interface UserPreferencesProviderProps {
  children: ReactNode;
  initialState?: UserPreferences;
}

export function UserPreferencesProvider({children, initialState}: UserPreferencesProviderProps) {
  const [state, dispatch] = useReducer(
    userPreferencesReducer,
    initialState,
    (provided) => provided ?? localStorageUserPreferencesRepository.getPreferences(),
  );

  useEffect(() => {
    localStorageUserPreferencesRepository.savePreferences(state);
  }, [state]);

  const toggleShowHints = useCallback(() => dispatch({type: "TOGGLE", key: "showHints"}), []);
  const toggleShowOccurrences = useCallback(() => dispatch({type: "TOGGLE", key: "showOccurrences"}), []);
  const toggleShowConflicts = useCallback(() => dispatch({type: "TOGGLE", key: "showConflicts"}), []);
  const toggleShowCircleMenu = useCallback(() => dispatch({type: "TOGGLE", key: "showCircleMenu"}), []);
  const toggleShowWrongEntries = useCallback(() => dispatch({type: "TOGGLE", key: "showWrongEntries"}), []);

  const value = useMemo(
    () => ({
      state,
      toggleShowHints,
      toggleShowOccurrences,
      toggleShowConflicts,
      toggleShowCircleMenu,
      toggleShowWrongEntries,
    }),
    [
      state,
      toggleShowHints,
      toggleShowOccurrences,
      toggleShowConflicts,
      toggleShowCircleMenu,
      toggleShowWrongEntries,
    ],
  );

  return <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>;
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
}
