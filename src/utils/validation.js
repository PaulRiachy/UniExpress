import { faculties } from '../constants/faculties.js';
export function registrationErrors(values) {
  const errors = {};
  const labels = {name:'Full name',email:'University email',university_id:'University ID',account_type:'Account type',faculty:'Faculty',phone:'Phone',password:'Password',passwordConfirm:'Password confirmation'};
  for (const key of Object.keys(labels)) if (!values[key]?.trim()) errors[key]=labels[key]+' is required.';
  if (values.email && !/^[^\s@]+@ua\.edu\.lb$/i.test(values.email.trim())) errors.email='Use your @ua.edu.lb university email.';
  if (values.university_id && !/^[A-Za-z0-9][A-Za-z0-9-]{2,31}$/.test(values.university_id.trim())) errors.university_id='Use 3-32 letters, numbers or hyphens, starting with a letter or number.';
  if (values.account_type && !['student','staff'].includes(values.account_type)) errors.account_type='Choose student or staff.';
  if (values.faculty && !faculties.includes(values.faculty)) errors.faculty='Choose your primary faculty.';
  if (values.password && values.password.length<8) errors.password='Use at least 8 password characters.';
  if (values.passwordConfirm && values.password!==values.passwordConfirm) errors.passwordConfirm='Passwords must match.';
  return errors;
}
export function validateRegistration(values) {return Object.values(registrationErrors(values))[0] || '';}

// Recheck the edited field without discarding other authoritative server errors.
export function revalidateRegistrationFields(previous, values, key) {
  const current = registrationErrors(values);
  const result = { ...previous };
  for (const field of key === 'password' ? ['password', 'passwordConfirm'] : [key]) {
    if (current[field]) result[field] = current[field];
    else delete result[field];
  }
  return result;
}
