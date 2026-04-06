import React from 'react';

import AuthForm from '../components/AuthForm';
import { loginUser } from '../utils/api';

export default function LoginPage() {
  return <AuthForm mode="login" submitAction={loginUser} />;
}
