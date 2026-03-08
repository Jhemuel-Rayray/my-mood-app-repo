try {
  const res = await api.get('/moods');
  // ...
} catch (error) {
  console.error('API error', error?.response?.status, error?.response?.data);
}