import React from 'react';

import AuthForm from '../components/AuthForm';
import { signupUser } from '../utils/api';

export default function SignupPage() {
  return <AuthForm mode="signup" submitAction={signupUser} />;
}
