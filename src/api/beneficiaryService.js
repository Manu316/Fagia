import apiClient from './api';

export default {
  filterDonations(days) {
    return apiClient.get(`/donation/filter/${days}`);
  },
  getDonatorInfoForDonation(donationId) {
    return apiClient.get(`/donation/${donationId}/donator`);
  }
};