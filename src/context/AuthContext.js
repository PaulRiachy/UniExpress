import { createContext, useEffect, useState, useRef } from 'react';
import * as auth from '../services/authService';
export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors,setFieldErrors]=useState({});
  const busy = useRef(false);
  useEffect(() => auth.subscribeAuth(value => { setUser(value); setReady(true); }), []);
  async function run(action) {
    if (busy.current) throw new Error('Please wait for the current request.');
    busy.current = true; setLoading(true); setError(''); setFieldErrors({});
    try { return await action(); }
    catch (e) { setError(e.message); setFieldErrors(e.fieldErrors || {}); throw e; }
    finally { busy.current = false; setLoading(false); }
  }
  return <AuthContext.Provider value={{ user, ready, loading, error, fieldErrors,
    clearError: () => {setError('');setFieldErrors({});},
    login: (...args) => run(() => auth.login(...args)),
    register: values => run(() => auth.register(values)),
    updateProfile: values => run(() => auth.updateProfile(values)),
    logout: () => { auth.logout(); setError(''); },
  }}>{children}</AuthContext.Provider>;
}
