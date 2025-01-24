import { supabase } from './supabase';
import { Profile } from './supabase';

// Password validation rules
const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecial: true,
};

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters long`);
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_RULES.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_RULES.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export async function signUp(email: string, password: string, userType: 'contractor' | 'user') {
  // Validate email
  if (!validateEmail(email)) {
    throw new Error('Please enter a valid email address');
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors.join('\n'));
  }

  const { data: auth, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/verify-email`,
    },
  });

  if (signUpError) throw signUpError;

  if (auth.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: auth.user.id,
        email,
        user_type: userType,
      });

    if (profileError) throw profileError;

    if (userType === 'contractor') {
      const { error: contractorError } = await supabase
        .from('contractor_profiles')
        .insert({
          id: auth.user.id,
        });

      if (contractorError) throw contractorError;
    }
  }

  return auth;
}

export async function signIn(email: string, password: string) {
  // Validate email
  if (!validateEmail(email)) {
    throw new Error('Please enter a valid email address');
  }

  // Check if email is verified
  const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers({
    filters: {
      email: email,
    },
  });

  if (getUserError) throw getUserError;

  const user = users?.[0];
  if (!user?.email_confirmed_at) {
    throw new Error('Please verify your email address before signing in. Check your inbox for the verification link.');
  }

  // Attempt to sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Enhance error messages
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Invalid email or password. Please try again.');
    }
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function updateProfile(profile: Partial<Profile>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Validate email if it's being updated
  if (profile.email && !validateEmail(profile.email)) {
    throw new Error('Please enter a valid email address');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}