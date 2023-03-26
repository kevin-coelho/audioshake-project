export function isDevOrTestEnvironment() {
  return ['development', 'test'].includes(process.env.NODE_ENV as string);
}

export function isProductionEnvironment() {
  return process.env.NODE_ENV === 'production';
}

export function isTestEnvironment() {
  return process.env.NODE_ENV === 'test';
}
