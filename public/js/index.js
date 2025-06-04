/* eslint-disable */
import { login, logout } from './login';
import { initMap } from './mapbox';
import { updateSetting } from './accountSetting';
import { showAlert } from './alert';
import { checkout } from './stripe';

// This file is the entry point for the JavaScript code in the public directory.
// It initializes various functionalities such as login, logout, map display, account settings, and checkout process.
// Import necessary functions from other modules

// DOM ELEMENTS
const mapEl = document.getElementById('map');
const loginFormEl = document.querySelector('.form--login');
const logoutEl = document.querySelector('.nav__el--logout');
const saveSettingEl = document.getElementById('save-setting');
const savePasswordEl = document.getElementById('save-password');
const checkoutBtnEl = document.getElementById('checkout-btn');

// DELEGATION
if (mapEl) {
  const locations = JSON.parse(mapEl.dataset.locations);
  initMap(locations);
}

if (loginFormEl) {
  loginFormEl.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutEl) {
  logoutEl.addEventListener('click', e => {
    e.preventDefault();
    logout();
  });
}

if (saveSettingEl) {
  saveSettingEl.addEventListener('click', e => {
    e.preventDefault();
    const form = new FormData();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const photo = document.getElementById('photo').files[0];

    form.append('name', name);
    form.append('email', email);
    form.append('photo', photo);

    if (name || email || photo) {
      updateSetting(form, 'data');
    } else {
      showAlert('error', 'Please provide a new name, email or photo');
    }
  });
}

if (savePasswordEl) {
  savePasswordEl.addEventListener('click', async e => {
    e.preventDefault();
    e.target.textContent = 'Updating...';
    e.target.disabled = true;

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSetting(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    e.target.textContent = 'Save password';
    e.target.disabled = false;
  });
}

if (checkoutBtnEl) {
  checkoutBtnEl.addEventListener('click', function(e) {
    e.preventDefault();
    this.textContent = 'Processing...';
    this.disabled = true;
    const { tourId } = this.dataset;
    checkout(tourId);
  });
}
