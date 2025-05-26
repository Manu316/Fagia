import apiClient from './api';

export default {
  getUserDonations() {
    return apiClient.get('/donation'); // Ruta autenticada general
  }
};