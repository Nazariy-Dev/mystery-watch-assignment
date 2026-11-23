import { rollWeighted } from './roll';

const entries = [
  { item: 'common', weight: 80 },
  { item: 'rare', weight: 16 },
  { item: 'epic', weight: 3 },
  { item: 'legendary', weight: 1 },
];

// The odds bars promise exact percentages; each weight must own exactly its slice of [0, 1).
test.each([
  [0, 'common'],
  [0.7999, 'common'],
  [0.8, 'rare'],
  [0.9599, 'rare'],
  [0.96, 'epic'],
  [0.9899, 'epic'],
  [0.99, 'legendary'],
  [0.999999, 'legendary'],
])('random %p lands on %p', (value, expected) => {
  expect(rollWeighted(entries, () => value)).toBe(expected);
});

// A box listing a watch at 0% must never hand it out, or the displayed odds are a lie.
test('never picks a zero-weight entry', () => {
  const withZero = [
    { item: 'never', weight: 0 },
    { item: 'always', weight: 1 },
  ];

  for (const value of [0, 0.5, 0.999999]) {
    expect(rollWeighted(withZero, () => value)).toBe('always');
  }
});
