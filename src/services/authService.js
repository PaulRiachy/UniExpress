import { faculties } from '../constants/faculties.js';
import pocketbase from './pocketbase.js';
import { serviceRequest } from './serviceRequest.js';
import { registrationErrors } from '../utils/validation.js';

function client() {
  if (!pocketbase) throw new Error('PocketBase URL is not configured.');
  return pocketbase;
}
const fields = ['name','email','university_id','account_type','faculty','phone'];
export function getCurrentUser() {
  return pocketbase?.authStore.isValid ? pocketbase.authStore.record : null;
}
export function subscribeAuth(listener) {
  if (!pocketbase) { listener(null); return () => {}; }
  return pocketbase.authStore.onChange(() => listener(getCurrentUser()), true);
}
export async function register(values) {
  const fieldErrors = registrationErrors(values);
  if (Object.keys(fieldErrors).length) {const error=new Error('Please correct the highlighted fields.');error.fieldErrors=fieldErrors;throw error;}
  const data = Object.fromEntries(fields.map(key => [key, values[key].trim()]));
  data.email = data.email.toLowerCase();
  const pb = client();
  return serviceRequest(options => pb.collection('users').create({ ...data,
    password: values.password, passwordConfirm: values.passwordConfirm }, options));
}
export async function login(email, password) {
  if (!/^[^\s@]+@ua\.edu\.lb$/i.test(email.trim()) || !password) throw new Error('Enter your university email and password.');
  const pb = client();
  try {
    const result = await serviceRequest(options => pb.collection('users').authWithPassword(email.trim().toLowerCase(), password, options));
    return result.record;
  } catch (error) {
    logout();
    if (error.message.startsWith('Request rejected')) throw new Error('Email or password is incorrect.');
    throw error;
  }
}
export function logout() { pocketbase?.cancelAllRequests(); pocketbase?.authStore.clear(); }
export async function updateProfile(values) {
  const user = getCurrentUser();
  if (!user) throw new Error('Please sign in again.');
  const data = Object.fromEntries(['name','faculty','phone'].map(key => [key, values[key]?.trim() || '']));
  if (!faculties.includes(data.faculty)) {const error=new Error('Choose your primary faculty.');error.fieldErrors={faculty:error.message};throw error;}
  if (Object.values(data).some(value => !value)) throw new Error('Name, faculty and phone are required.');
  const record = await serviceRequest(options => client().collection('users').update(user.id, data, options));
  if (getCurrentUser()?.id === user.id) pocketbase.authStore.save(pocketbase.authStore.token, record);
  return record;
}
export async function fetchProfile() {
  const user = getCurrentUser();
  if (!user) throw new Error('Please sign in again.');
  return serviceRequest(options => client().collection('users').getOne(user.id, options));
}
