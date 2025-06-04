/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';
import { logout } from './login';

// type can be: 'password' or 'data'
export const updateSetting = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${
        type === 'password' ? 'updateMyPassword' : 'updateMe'
      }`,
      data
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `${type === 'password' ? 'Password' : 'Data'} updated successfully!`
      );
      window.setTimeout(async () => {
        if (type === 'password') {
          return await logout(true);
        }
        location.reload(true);
      }, 500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
