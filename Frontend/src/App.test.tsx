import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login form', () => {
  render(<App />);
  const loginElement = screen.getByText(/ApiMonitor - Connexion/i);
  expect(loginElement).toBeInTheDocument();
});

test('renders email input field', () => {
  render(<App />);
  const emailInput = screen.getByPlaceholderText(/admin@local.test/i);
  expect(emailInput).toBeInTheDocument();
});

test('renders password input field', () => {
  render(<App />);
  const passwordInput = screen.getByPlaceholderText(/Mot de passe/i);
  expect(passwordInput).toBeInTheDocument();
});
