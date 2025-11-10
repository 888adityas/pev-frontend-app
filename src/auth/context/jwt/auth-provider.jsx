import { useDispatch, useSelector } from 'react-redux';
import { useMemo, useEffect, useCallback } from 'react';

import { fetchUserSession } from 'src/redux/slice/userSlice';

import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const checkUserSession = useCallback(async () => {
    dispatch(fetchUserSession()); // Trigger the thunk to check the user session
  }, [dispatch]);

  // =====================================================

  const { user, status } = useSelector((state) => state.user);
  // =====================================================

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  // const checkAuthenticated = user ? 'authenticated' : 'unauthenticated';

  // const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: user
        ? {
            ...user,
            role: user?.role ?? 'admin',
          }
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
