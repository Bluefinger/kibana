/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { ESQL_CONTROL } from '@kbn/controls-constants';
import { getESQLQueryVariables } from '@kbn/esql-utils';
import type { SavedSearch } from '@kbn/saved-search-plugin/public';
import { isOfAggregateQueryType } from '@kbn/es-query';

interface DashboardLayoutForDiscoverExport {
  panels: Record<string, { type: string }>;
  /** Top-of-dashboard pinned controls (same child APIs as grid panels). */
  pinnedPanels?: Record<string, { type: string }>;
}

interface DashboardParentForDiscoverExport {
  layout$: { getValue: () => DashboardLayoutForDiscoverExport };
  getSerializedStateForChild: (childId: string) => unknown;
}

const isDashboardParentForDiscoverExport = (
  parentApi: unknown
): parentApi is DashboardParentForDiscoverExport =>
  Boolean(
    parentApi &&
      typeof parentApi === 'object' &&
      'layout$' in parentApi &&
      'getSerializedStateForChild' in parentApi &&
      typeof (parentApi as DashboardParentForDiscoverExport).layout$.getValue === 'function' &&
      typeof (parentApi as DashboardParentForDiscoverExport).getSerializedStateForChild ===
        'function'
  );

/**
 * Builds a control-group JSON string from dashboard ES|QL control panels that are related
 * to the Discover panel's query (by variable names), for passing into Discover via editor
 * transfer without persisting controls on the embeddable state.
 */
export const serializeRelatedDashboardEsqlControlsForDiscover = (
  parentApi: unknown,
  discoverPanelUuid: string,
  savedSearch: SavedSearch
): string | undefined => {
  if (!isDashboardParentForDiscoverExport(parentApi)) {
    return undefined;
  }

  const query = savedSearch.searchSource.getField('query');
  if (!isOfAggregateQueryType(query)) {
    return undefined;
  }

  const variablesInQuery = getESQLQueryVariables(query.esql);
  if (!variablesInQuery.length) {
    return undefined;
  }

  const layout = parentApi.layout$.getValue();
  /** Dashboard serialized panel state; re-parsed by `addControlsFromSavedSession` as control group JSON. */
  const controlsState: Record<string, unknown> = {};

  const maybeAddControlPanel = (panelId: string, panelType: string) => {
    if (panelId === discoverPanelUuid || panelType !== ESQL_CONTROL) {
      return;
    }
    const serialized = parentApi.getSerializedStateForChild(panelId);
    if (!serialized || typeof serialized !== 'object') {
      return;
    }
    const variableName = (serialized as { variable_name?: unknown }).variable_name;
    if (typeof variableName !== 'string' || !variablesInQuery.includes(variableName)) {
      return;
    }
    // Dashboard child serialization is the control's `getLatestState()` shape, which omits `type`.
    // Discover's control group layout and variable extraction require `type: esql_control`.
    controlsState[panelId] = {
      ...(serialized as Record<string, unknown>),
      type: ESQL_CONTROL,
    };
  };

  for (const [panelId, panel] of Object.entries(layout.panels)) {
    maybeAddControlPanel(panelId, panel.type);
  }

  for (const [panelId, panel] of Object.entries(layout.pinnedPanels ?? {})) {
    maybeAddControlPanel(panelId, panel.type);
  }

  return Object.keys(controlsState).length ? JSON.stringify(controlsState) : undefined;
};
