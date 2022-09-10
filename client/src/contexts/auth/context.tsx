import React, { ReactNode, FC, useReducer, useEffect } from "react";
import API from "../../services/api";
import useAxios from "axios-hooks";

import {
  initialState,
  AuthReducer,
  AuthStateType,
  ActionType,
} from "./reducer";

const AuthStateContext = React.createContext<AuthStateType>(initialState);
const AuthDispatchContext = React.createContext<React.Dispatch<ActionType>>(
  () => {}
);

export function useAuthState() {
  const context = React.useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error("useAuthState must be used within a AuthProvider");
  }

  return context;
}

export function useAuthDispatch(): React.Dispatch<ActionType> {
  const context = React.useContext(AuthDispatchContext);
  if (context === undefined) {
    throw new Error("useAuthDispatch must be used within a AuthProvider");
  }

  return context;
}

// type Props = { children: ReactNode };

export const AuthProvider = ({ children }: any) => {
  const [{ data, loading, error }, refetch] = useAxios({
    baseURL: process.env.REACT_APP_API_URL,
    url: "/login",
    method: "POST",
    data: { 
      accessToken: localStorage.getItem('access_token')
    }
  });

  const [authState, dispatch] = useReducer(AuthReducer, {
    ...initialState,
    refetch,
  });

  useEffect(() => {
    const key = setInterval(() => {
      refetch();
    }, 1000 * 60 * 5);

    return () => {
      clearInterval(key);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      dispatch({ type: "UNSET_LOADING" });
      if (data && !data.errors) {
        dispatch({
          type: "SET_USER",
          payload: data,
        });
      }
    }
  }, [loading, data]);

  return (
    <AuthStateContext.Provider value={authState}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
};
