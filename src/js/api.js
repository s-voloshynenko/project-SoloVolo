import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-energy.b.goit.study/api',
});

export async function subscribe(email) {
  const { data } = await api.post('/subscription', { email });
  return data;
}
