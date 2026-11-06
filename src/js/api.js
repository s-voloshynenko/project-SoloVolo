import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-energy.b.goit.study/api',
});

export async function subscribe(email) {
  const { data } = await api.post('/subscription', { email });
  return data;
}

export async function getQuote() {
  const { data } = await api.get('/quote');
  return data;
}

export async function getFilters({ filter, page = 1, limit = 12 }) {
  const { data } = await api.get('/filters', {
    params: { filter, page, limit },
  });
  return data;
}

const FILTER_PARAMS = {
  Muscles: 'muscles',
  'Body parts': 'bodypart',
  Equipment: 'equipment',
};

export async function getExercises({
  filter,
  category,
  keyword,
  page = 1,
  limit = 10,
}) {
  const params = { [FILTER_PARAMS[filter]]: category, page, limit };
  if (keyword) params.keyword = keyword;

  const { data } = await api.get('/exercises', { params });
  return data;
}

export async function getExerciseById(id) {
  const { data } = await api.get(`/exercises/${id}`);
  return data;
}
