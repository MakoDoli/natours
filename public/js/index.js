/*eslint-disable*/
import '@babel/polyfill';
import { login } from './login';
import { displayMap } from './mapBox';

const mapBox = document.getElementById('map');
const form = document.querySelector('.form');

if (mapBox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations,
  );

  displayMap(locations);
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
