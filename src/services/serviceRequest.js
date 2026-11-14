const labels = {email:'Email',university_id:'University ID',password:'Password',passwordConfirm:'Password confirmation',name:'Full name',faculty:'Faculty',phone:'Phone number',account_type:'Account type',label:'Location label',room:'Room number',building:'Building'};
function fieldMessage(key, code) {
  const label = labels[key];
  if (/unique|already|exists/.test(code)) return label + ' is already in use.';
  if (/required/.test(code)) return label + ' is required.';
  if (key === 'email') return 'Enter a valid @ua.edu.lb university email; it may already be registered.';
  if (key === 'university_id') return 'Use a unique university ID: 3-32 letters, numbers or hyphens, starting with a letter or number.';
  if (key === 'password') return 'Password must have at least 8 characters.';
  if (key === 'passwordConfirm') return 'Passwords must match.';
  return 'Check ' + label.toLowerCase() + '.';
}
export async function serviceRequest(action) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {timedOut=true;controller.abort();},10000);
  try { return await action({signal:controller.signal,requestKey:null}); }
  catch (cause) {
    const status = Number(cause.status || cause.response?.status || 0);
    const details = cause.response?.data || {};
    const fieldErrors = Object.fromEntries(Object.keys(details).filter(key => labels[key]).map(key => [key,fieldMessage(key,details[key]?.code || '')]));
    if (typeof __DEV__ !== 'undefined' && __DEV__) console.info('PocketBase request failed', {status,fields:Object.keys(fieldErrors),timedOut});
    let message = 'Something went wrong. Please try again.';
    if (timedOut) message = 'Connection timed out. Check the server and retry.';
    else if (status === 0 && (cause.status === 0 || cause instanceof TypeError && /network|fetch/i.test(cause.message))) message = 'Connection failed. Check your network and PocketBase server, then retry.';
    else if (Object.keys(fieldErrors).length) message = 'Please correct the highlighted fields.';
    else if (status === 400) message = 'Request rejected. Check your details and try again.';
    else if (status === 401) message = 'Please sign in again.';
    else if (status === 403) message = 'This request is not permitted. Check that the backend registration migration is applied.';
    else if (status >= 500) message = 'The server could not complete this request. Please retry later.';
    const error = new Error(message);error.status=status;error.fieldErrors=fieldErrors;throw error;
  } finally {clearTimeout(timer);}
}
