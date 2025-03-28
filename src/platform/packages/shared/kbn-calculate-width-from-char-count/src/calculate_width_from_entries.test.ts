/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { calculateWidthFromEntries } from './calculate_width_from_entries';
import { MAX_WIDTH } from './calculate_width_from_char_count';
import { faker } from '@faker-js/faker';

const generateObjectWithLabelOfLength = (length: number, propOverrides?: Record<string, any>) => ({
  label: faker.string.alpha(length),
  ...propOverrides,
});

describe('calculateWidthFromEntries', () => {
  it('calculates width for array of strings', () => {
    const shortLabels = [10, 20].map(faker.string.alpha);
    expect(calculateWidthFromEntries(shortLabels)).toBe(256);

    const mediumLabels = [50, 55, 10, 20].map(faker.string.alpha);
    expect(calculateWidthFromEntries(mediumLabels)).toBe(501);

    const longLabels = [80, 90, 10].map(faker.string.alpha);
    expect(calculateWidthFromEntries(longLabels)).toBe(MAX_WIDTH);
  });

  it('calculates width for array of objects with keys', () => {
    const shortLabels = [10, 20].map((v) => generateObjectWithLabelOfLength(v));
    expect(calculateWidthFromEntries(shortLabels, ['label'])).toBe(256);

    const mediumLabels = [50, 55, 10, 20].map((v) => generateObjectWithLabelOfLength(v));
    expect(calculateWidthFromEntries(mediumLabels, ['label'])).toBe(501);

    const longLabels = [80, 90, 10].map((v) => generateObjectWithLabelOfLength(v));
    expect(calculateWidthFromEntries(longLabels, ['label'])).toBe(MAX_WIDTH);
  });
  it('calculates width for array of objects for fallback keys', () => {
    const shortLabels = [10, 20].map((v) =>
      generateObjectWithLabelOfLength(v, { label: undefined, name: faker.string.alpha(v) })
    );
    expect(calculateWidthFromEntries(shortLabels, ['id', 'label', 'name'])).toBe(256);

    const mediumLabels = [50, 55, 10, 20].map((v) =>
      generateObjectWithLabelOfLength(v, { label: undefined, name: faker.string.alpha(v) })
    );
    expect(calculateWidthFromEntries(mediumLabels, ['id', 'label', 'name'])).toBe(501);
  });
});
