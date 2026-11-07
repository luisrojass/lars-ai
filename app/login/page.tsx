import { redirect } from 'next/navigation';

// El acceso ahora se hace desde el modal de la barra superior.
export default function LoginPage() {
  redirect('/');
}
