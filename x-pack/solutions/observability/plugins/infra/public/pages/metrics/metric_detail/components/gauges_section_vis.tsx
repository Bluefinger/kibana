/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  EuiFlexItem,
  EuiPageSection,
  EuiPanel,
  EuiProgress,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { get, last, max } from 'lodash';
import type { ReactText } from 'react';
import React from 'react';
import styled from '@emotion/styled';
import type { InventoryFormatterType } from '@kbn/metrics-data-access-plugin/common';
import { createFormatter } from '../../../../../common/formatters';
import type { SeriesOverrides, VisSectionProps } from '../types';
import { getChartName } from './helpers';

const getFormatter =
  (
    defaultFormatter: InventoryFormatterType = 'number',
    defaultFormatterTemplate: string = '{{value}}',
    seriesOverrides: SeriesOverrides = {},
    seriesId: string
  ) =>
  (val: ReactText) => {
    if (val == null) {
      return '';
    }
    const formatter = get(seriesOverrides, [seriesId, 'formatter'], defaultFormatter);
    const formatterTemplate = get(
      seriesOverrides,
      [seriesId, 'formatterTemplate'],
      defaultFormatterTemplate
    );
    return createFormatter(formatter, formatterTemplate)(val);
  };

export const GaugesSectionVis = ({
  id,
  metric,
  seriesOverrides,
  formatter,
  formatterTemplate,
}: VisSectionProps) => {
  if (!metric || !id) {
    return null;
  }
  return (
    <EuiPageSection>
      <EuiSpacer size="m" />
      <GroupBox>
        {metric.series.map((series) => {
          const lastDataPoint = last(series.data);
          if (!lastDataPoint) {
            return null;
          }
          const formatterFn = getFormatter(
            formatter,
            formatterTemplate,
            seriesOverrides,
            series.id
          );
          const value = formatterFn(lastDataPoint.value || 0);
          const name = getChartName(seriesOverrides, series.id, series.id);
          const dataMax = max(series.data.map((d) => d.value || 0));
          const gaugeMax = get(seriesOverrides, [series.id, 'gaugeMax'], dataMax);
          return (
            <EuiFlexItem key={`${id}-${series.id}`} style={{ margin: '0.4rem' }}>
              <EuiPanel style={{ minWidth: '160px' }}>
                <EuiText style={{ textAlign: 'right' }} size="s">
                  {name}
                </EuiText>
                <EuiTitle size="s">
                  <h1 style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{value}</h1>
                </EuiTitle>
                <EuiProgress
                  value={lastDataPoint.value || 0}
                  max={gaugeMax}
                  size="s"
                  color="primary"
                />
              </EuiPanel>
            </EuiFlexItem>
          );
        })}
      </GroupBox>
      <EuiSpacer size="m" />
    </EuiPageSection>
  );
};

const GroupBox = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
`;
