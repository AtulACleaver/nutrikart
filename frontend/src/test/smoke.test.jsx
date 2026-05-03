import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

describe('Frontend Route Smoke Test', () => {
  it('renders app root without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
