import axios from 'axios';

const api = axios.create({
  baseURL: 'https://52-246-136-171.sslip.io/api',
});

export default api;
