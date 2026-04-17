/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { createSearchSourceMock } from '@kbn/data-plugin/public/mocks';
import { ESQL_CONTROL } from '@kbn/controls-constants';
import type { SavedSearch } from '@kbn/saved-search-plugin/public';
import { serializeRelatedDashboardEsqlControlsForDiscover } from './serialize_related_dashboard_esql_controls_for_discover';

describe('serializeRelatedDashboardEsqlControlsForDiscover', () => {
  const discoverUuid = 'discover-panel';

  const savedSearchWithEsql = (): SavedSearch =>
    ({
      searchSource: createSearchSourceMock({
        query: { esql: 'FROM idx | WHERE field > ?threshold' },
      }),
    } as unknown as SavedSearch);

  it('returns undefined when parent is not a dashboard-like API', () => {
    const savedSearch = savedSearchWithEsql();

    expect(serializeRelatedDashboardEsqlControlsForDiscover({}, discoverUuid, savedSearch)).toBe(
      undefined
    );
  });

  it('serializes ES|QL control panels whose variable names appear in the query', () => {
    const savedSearch = savedSearchWithEsql();

    const parentApi = {
      layout$: {
        getValue: () => ({
          panels: {
            [discoverUuid]: { type: 'search' },
            ctrl1: { type: ESQL_CONTROL },
            other: { type: ESQL_CONTROL },
          },
        }),
      },
      getSerializedStateForChild: (id: string) => {
        if (id === 'ctrl1') {
          return { variable_name: 'threshold', title: 'T' };
        }
        if (id === 'other') {
          return { variable_name: 'unused', title: 'U' };
        }
        return undefined;
      },
    };

    const json = serializeRelatedDashboardEsqlControlsForDiscover(
      parentApi,
      discoverUuid,
      savedSearch
    );

    expect(json).toBeDefined();
    const parsed = JSON.parse(json!);
    expect(Object.keys(parsed)).toEqual(['ctrl1']);
    expect(parsed.ctrl1).toEqual({ variable_name: 'threshold', title: 'T' });
  });

  it('serializes ES|QL controls from pinnedPanels when they match the query', () => {
    const savedSearch = savedSearchWithEsql();

    const parentApi = {
      layout$: {
        getValue: () => ({
          panels: {
            [discoverUuid]: { type: 'search' },
          },
          pinnedPanels: {
            pinnedCtrl: { type: ESQL_CONTROL },
          },
        }),
      },
      getSerializedStateForChild: (id: string) =>
        id === 'pinnedCtrl' ? { variable_name: 'threshold', title: 'Pinned' } : undefined,
    };

    const json = serializeRelatedDashboardEsqlControlsForDiscover(
      parentApi,
      discoverUuid,
      savedSearch
    );

    expect(json).toBeDefined();
    const parsed = JSON.parse(json!);
    expect(Object.keys(parsed)).toEqual(['pinnedCtrl']);
    expect(parsed.pinnedCtrl).toEqual({ variable_name: 'threshold', title: 'Pinned' });
  });
});
