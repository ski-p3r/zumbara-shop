export const formatETB = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
  }).format(value);
};
