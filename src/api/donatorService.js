import apiClient from './api';

export default {
  getAliments() {
    return apiClient.get('/aliments');
  },
  createAliment(alimentData) {
    return apiClient.post('/aliments', alimentData);
  },
  getAlimentById(id) { // Suponiendo que /aliments/{ID} [POST] sea un GET
    return apiClient.get(`/aliments/${id}`);
  },
  deleteAliment(id) {
    return apiClient.delete(`/aliments/${id}`);
  },
  createDonation(donationData) {
    return apiClient.post('/donation', donationData); // Ruta protegida para Donador
  }
};