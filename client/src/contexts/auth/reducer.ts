import { MyNamespace } from "../../types";

export type AuthStateType<
  TUser extends MyNamespace.User = MyNamespace.User
> = {
  user: TUser | null;
  loading: boolean;
  errorMessage: string;
  refetch: () => Promise<any>;
};

export type ActionType = {
  type: string;
  payload?: AuthStateType["user"];
  error?: string;
};

export const initialState: AuthStateType = {
  user: null,
  loading: true,
  errorMessage: "",
  refetch: async () => {},
};

export const AuthReducer = (
  state: AuthStateType,
  action: ActionType
): AuthStateType => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: true };
    case "UNSET_LOADING":
      return { ...state, loading: false };
    case "SET_USER":
      return {
        ...state,
        user: action.payload!,
        errorMessage: "",
      };
    case "UNSET_USER":
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
};
