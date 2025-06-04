/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:5005/api/v1/users/login',
      data: {
        email,
        password
      },
      withCredentials: true
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Login successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    const { message, status } = err.response.data;
    showAlert('error', message);
  }
};

export const logout = async (redirect = false) => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:5005/api/v1/users/logout'
    });

    if (res.data.status === 'success') {
      if (redirect) {
        return location.assign('/login');
      }
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', 'Error logging out, Try again.');
  }
};
