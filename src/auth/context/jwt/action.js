import axios, {
  endpoints,
  setBasicAuthCredentials,
  clearBasicAuthCredentials,
} from 'src/utils/axios';

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }) => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const response = res.data;
    console.log('Sign in response:', response);

    if (response.status !== 'success') {
      throw new Error('Error during sign in');
    }

    // Set credentials for basic auth ================
    const credResponse = await axios.post(endpoints.auth.credentials, {});
    const data = await credResponse.data.data;
    if (data) {
      const { apiKey, secretKey } = data;
      setBasicAuthCredentials({
        apiKey,
        secretKey,
        persist: 'session', // or 'session'
      });
    }
    // ===============================================
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ email, password, first_name, last_name }) => {
  const params = {
    email,
    password,
    first_name,
    last_name,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const signupResponse = res.data;

    if (signupResponse.status !== 'success') {
      throw new Error('Error during sign up');
    }

    // Set credentials for basic auth ================
    const credResponse = await axios.post(endpoints.auth.credentials, {});
    const data = await credResponse.data.data;
    if (data) {
      const { apiKey, secretKey } = data;
      setBasicAuthCredentials({
        apiKey,
        secretKey,
        persist: 'session', // or 'session'
      });
    }
    // ===============================================

    return signupResponse;
  } catch (error) {
    console.error('Error during sign up:', error);
    return error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    const res = await axios.get(endpoints.auth.signOut, {});

    const signOutResponse = res.data;

    if (signOutResponse.status !== 'success') {
      throw new Error('Error during sign out');
    }

    // Clear credentials for basic auth
    clearBasicAuthCredentials();

    return signOutResponse;
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
