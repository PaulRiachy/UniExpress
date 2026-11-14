import pocketbase from './pocketbase.js';
import { getCurrentUser } from './authService.js';
import { serviceRequest } from './serviceRequest.js';
function requireUser() {
  const user = getCurrentUser();
  if (!user || !pocketbase) throw new Error('Please sign in again.');
  return user;
}
export function getBuildings() {
  requireUser();
  return serviceRequest(options => pocketbase.collection('buildings').getFullList({ ...options, filter: 'is_active = true', sort: 'code' }));
}
export function getSavedLocations() {
  requireUser();
  return serviceRequest(options => pocketbase.collection('saved_locations').getFullList({ ...options, sort: 'label', expand: 'building' }));
}
export function saveLocation(values, id) {
  const user = requireUser();
  const data = { label: values.label.trim(), room: values.room.trim(), building: values.building };
  if (!data.label || !data.room || !data.building) throw new Error('Label, building and room are required.');
  return serviceRequest(options => id
    ? pocketbase.collection('saved_locations').update(id, data, options)
    : pocketbase.collection('saved_locations').create({ ...data, user: user.id }, options));
}
export function deleteLocation(id) {
  requireUser();
  return serviceRequest(options => pocketbase.collection('saved_locations').delete(id, options));
}
