import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import Button from '@mui/material/Button';

import { logout } from 'src/redux/slice/userSlice';

import { useAuthContext } from 'src/auth/hooks';
import { signOut } from 'src/auth/context/jwt/action';

// ----------------------------------------------------------------------

export function SignOutButton({ onClose, ...other }) {
  const dispatch = useDispatch();
  const { checkUserSession } = useAuthContext();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      await checkUserSession?.();
      dispatch(logout()); // trigger the thunk to logout user session

      onClose?.();

      // also logout from pabbly accounts (when in production)
      window.location.href = 'https://accounts.pabbly.com/logout';

      // for development just refresh the page
      // router.refresh();
    } catch (error) {
      console.error(error);
    }
  }, [dispatch, checkUserSession, onClose]);

  return (
    <Button fullWidth variant="soft" size="large" color="error" onClick={handleLogout} {...other}>
      Logout
    </Button>
  );
}
