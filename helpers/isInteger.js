export const isInteger = (value) => {
  const number = Number(value);
  return !isNaN(number) && number >= 0;
};
