/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const updateData = async (name, email) => {
  try {
    console.log(name, email);
    const res = await axios({
      method: 'PATCH',
      url: 'http://localhost:3000/api/v1/users/updateMe',
      data: {
        name,
        email,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Data was updated successfully');
    }
  } catch (err) {
    showAlert('error', err.response, DataTransfer.message);
  }
};
