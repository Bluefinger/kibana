/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { i18n } from '@kbn/i18n';
import { Streams } from '@kbn/streams-schema';
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiTitle,
  EuiTabs,
  EuiTab,
  EuiSpacer,
  useGeneratedHtmlId,
} from '@elastic/eui';
import { DatasetQualityIndicator } from '@kbn/dataset-quality-plugin/public';
import {
  StreamFlyoutDetailContextProvider,
  useStreamDetail,
} from '../../hooks/use_stream_flyout_detail';
import { useKibana } from '../../hooks/use_kibana';
import { ClassicStreamBadge, LifecycleBadge, WiredStreamBadge } from '../stream_badges';
import { useDataSetQuality } from '../../hooks/use_data_set_quality';
import { useStreamsAppRouter } from '../../hooks/use_streams_app_router';
import { StreamAttachments } from './stream_attachments';
import { StreamQuality } from './stream_quality';
import { StreamRetention } from './stream_retention';
import { ViewInDiscoverButton } from './discover_button';
import { useTimeRange } from '../../hooks/use_time_range';
import { StreamFlyoutOverview } from './stream_flyout_overview';

const TABS = [
  {
    id: 'overview',
    label: i18n.translate('xpack.streams.flyout.tab.overview', {
      defaultMessage: 'Overview',
    }),
  },
  {
    id: 'quality',
    label: i18n.translate('xpack.streams.flyout.tab.quality', {
      defaultMessage: 'Quality',
    }),
  },
  {
    id: 'retention',
    label: i18n.translate('xpack.streams.flyout.tab.retention', {
      defaultMessage: 'Retention',
    }),
  },
  {
    id: 'attachments',
    label: i18n.translate('xpack.streams.flyout.tab.attachments', {
      defaultMessage: 'Attachments',
    }),
  },
];

const TAB_PAGES: Record<string, () => React.JSX.Element> = {
  overview: () => <StreamFlyoutOverview />,
  quality: () => <StreamQuality />,
  attachments: () => <StreamAttachments />,
  retention: () => <StreamRetention />,
};

function StreamFlyoutContent({ name, onClose }: StreamFlyoutProps) {
  const { loading, definition } = useStreamDetail();
  const { push } = useStreamsAppRouter();
  const { rangeFrom, rangeTo } = useTimeRange();
  const { quality, isQualityLoading } = useDataSetQuality(name, definition);
  const [selectedTab, selectTab] = useState('overview');
  const headerId = useGeneratedHtmlId();

  const renderTabs = useMemo(
    () =>
      TABS.map(({ id, label }) => (
        <EuiTab
          isSelected={id === selectedTab}
          onClick={() => selectTab(id)}
          key={id}
          data-test-subj={`streamsCanvasFlyoutTab-${id}`}
        >
          {label}
        </EuiTab>
      )),
    [selectedTab]
  );

  const page = useMemo(() => TAB_PAGES[selectedTab](), [selectedTab]);
  const badges = [];

  if (loading) {
    badges.push(
      <EuiFlexItem grow={false}>
        <EuiLoadingSpinner size="s" />
      </EuiFlexItem>
    );
  }

  if (definition) {
    badges.push(
      <DatasetQualityIndicator
        quality={quality}
        isLoading={isQualityLoading}
        verbose={true}
        showTooltip={true}
      />
    );
  }

  let discoverButton = null;

  if (definition && Streams.WiredStream.GetResponse.is(definition)) {
    badges.push(
      <EuiFlexItem grow={false}>
        <WiredStreamBadge />
      </EuiFlexItem>
    );
  }

  if (definition && Streams.ClassicStream.GetResponse.is(definition)) {
    badges.push(
      <EuiFlexItem grow={false}>
        <LifecycleBadge lifecycle={definition.effective_lifecycle} />
      </EuiFlexItem>,
      <EuiFlexItem grow={false}>
        <ClassicStreamBadge />
      </EuiFlexItem>
    );

    discoverButton = (
      <EuiFlexItem grow={false}>
        <ViewInDiscoverButton
          stream={definition.stream}
          indexMode={definition.index_mode ?? 'standard'}
          hasDataStream={definition.data_stream_exists}
        />
      </EuiFlexItem>
    );
  }

  return (
    <EuiFlyout
      size="l"
      aria-labelledby={headerId}
      onClose={onClose}
      data-test-subj="streamsCanvasFlyout"
      paddingSize="none"
      flyoutMenuProps={{
        customActions: [
          {
            iconType: 'share',
            'aria-label': i18n.translate('xpack.streams.flyout.tab.goToLink', {
              defaultMessage: 'Go to Stream Details',
            }),
            onClick: () => {
              push('/{key}', {
                path: { key: name },
                query: { rangeFrom, rangeTo },
              });
            },
          },
        ],
      }}
    >
      <EuiFlyoutHeader hasBorder>
        <EuiFlexGroup
          justifyContent="spaceBetween"
          css={css`
            padding: 12px 25px 0;
          `}
        >
          <EuiFlexItem>
            <EuiFlexGroup
              alignItems="center"
              css={css`
                min-height: 32px;
              `}
              gutterSize="s"
            >
              <EuiFlexItem grow={false}>
                <EuiTitle size="s" data-test-subj="streamsCanvasFlyoutTitle">
                  <h1 id={headerId}>{name}</h1>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFlexGroup gutterSize="xs">{badges}</EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          {discoverButton}
        </EuiFlexGroup>
        <EuiSpacer size="s" />
        <EuiTabs
          css={css`
            padding: 0 25px;
            margin-bottom: -1px;
          `}
          data-test-subj="streamsCanvasFlyoutTabs"
        >
          {renderTabs}
        </EuiTabs>
      </EuiFlyoutHeader>
      <EuiFlyoutBody data-test-subj="streamsCanvasFlyoutBody">
        <div
          css={css`
            padding: 25px;
          `}
        >
          {loading ? (
            <EuiFlexGroup justifyContent="center" alignItems="center">
              <EuiLoadingSpinner data-test-subj="streamsCanvasFlyout-loading" size="xxl" />
            </EuiFlexGroup>
          ) : (
            page
          )}
        </div>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}

export interface StreamFlyoutProps {
  name: string;
  onClose: () => void;
}

export function StreamFlyout({ name, onClose }: StreamFlyoutProps) {
  const { streamsRepositoryClient } = useKibana().dependencies.start.streams;

  return (
    <StreamFlyoutDetailContextProvider
      name={name}
      streamsRepositoryClient={streamsRepositoryClient}
    >
      <StreamFlyoutContent name={name} onClose={onClose} />
    </StreamFlyoutDetailContextProvider>
  );
}
