import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IUser } from "@/types";
import { tokenStore } from "@/redux/token";

interface AuthState {
  user: IUser | null;
  token: string | null;
  /** False until the initial /user/me probe settles, so guards don't flash. */
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: IUser | null; token?: string }>,
    ) {
      state.user = action.payload.user;
      if (action.payload.token) {
        state.token = action.payload.token;
        tokenStore.set(action.payload.token);
      }
      state.initialized = true;
    },
    setUser(state, action: PayloadAction<IUser | null>) {
      state.user = action.payload;
      state.initialized = true;
    },
    setInitialized(state) {
      state.initialized = true;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.initialized = true;
      tokenStore.clear();
    },
  },
});

export const { setCredentials, setUser, setInitialized, logout } =
  authSlice.actions;
export default authSlice.reducer;
