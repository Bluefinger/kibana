/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useMemo, useState } from 'react';
import { i18n } from '@kbn/i18n';
import { Streams } from '@kbn/streams-schema';
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiEmptyPrompt,
  EuiPageTemplate,
} from '@elastic/eui';
import {
  StreamFlyoutDetailContextProvider,
  useStreamDetail,
} from '../../hooks/use_stream_flyout_detail';
import { useKibana } from '../../hooks/use_kibana';
import { StreamOverview } from '../stream_detail_overview';
import { StreamDetailDataQuality } from '../stream_data_quality';
import { StreamDetailAttachments } from '../stream_detail_attachments';
import { StreamDetailLifecycle } from '../stream_management/data_management/stream_detail_lifecycle';
import { WiredStreamBadge } from '../stream_badges';

const TAB_PAGES: Record<string, () => React.JSX.Element> = {
  overview: () => <StreamOverview />,
  quality: () => <StreamQuality />,
  attachments: () => <StreamAttachments />,
  retention: () => <StreamRetention />,
};

const ERROR_PROMPT = (
  <EuiEmptyPrompt
    iconType="error"
    color="danger"
    title={
      <h2>
        {i18n.translate('xpack.streams.flyout.error.title', {
          defaultMessage: 'Unable to load the tab',
        })}
      </h2>
    }
    body={
      <p>
        {i18n.translate('xpack.streams.flyout.error.description', {
          defaultMessage: 'A problem was encountered with the stream, and is unable to be shown.',
        })}
      </p>
    }
  />
);

function StreamRetention() {
  const { loading, definition, refresh } = useStreamDetail();

  if (loading) {
    return (
      <EuiFlexGroup justifyContent="center" alignItems="center">
        <EuiLoadingSpinner size="xxl" />
      </EuiFlexGroup>
    );
  }

  return !definition || Streams.QueryStream.GetResponse.is(definition) ? (
    ERROR_PROMPT
  ) : (
    <EuiFlexGroup>
      <EuiFlexItem>
        <StreamDetailLifecycle definition={definition} refreshDefinition={refresh} />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

function StreamAttachments() {
  const { loading, definition } = useStreamDetail();

  if (loading) {
    return (
      <EuiFlexGroup justifyContent="center" alignItems="center">
        <EuiLoadingSpinner size="xxl" />
      </EuiFlexGroup>
    );
  }

  return !definition || Streams.QueryStream.GetResponse.is(definition) ? (
    ERROR_PROMPT
  ) : (
    <EuiFlexGroup>
      <EuiFlexItem>
        <StreamDetailAttachments definition={definition} />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

function StreamQuality() {
  const { loading, definition, refresh } = useStreamDetail();

  if (loading) {
    return (
      <EuiFlexGroup justifyContent="center" alignItems="center">
        <EuiLoadingSpinner size="xxl" />
      </EuiFlexGroup>
    );
  }

  return !definition || Streams.QueryStream.GetResponse.is(definition) ? (
    ERROR_PROMPT
  ) : (
    <EuiFlexGroup>
      <EuiFlexItem>
        <StreamDetailDataQuality definition={definition} refreshDefinition={refresh} />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

function StreamInnerBody({ name, onClose }: StreamFlyoutProps) {
  const { loading, definition } = useStreamDetail();
  const [selectedTab, selectTab] = useState('overview');

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      isSelected: selectedTab === 'overview',
      onClick: () => selectTab('overview'),
    },
    {
      id: 'quality',
      label: 'Quality',
      isSelected: selectedTab === 'quality',
      onClick: () => selectTab('quality'),
    },
    {
      id: 'retention',
      label: 'Retention',
      isSelected: selectedTab === 'retention',
      onClick: () => selectTab('retention'),
    },
    {
      id: 'attachments',
      label: 'Attachments',
      isSelected: selectedTab === 'attachments',
      onClick: () => selectTab('attachments'),
    },
  ];

  const page = useMemo(() => TAB_PAGES[selectedTab](), [selectedTab]);
  const badges = [];

  if (definition && Streams.WiredStream.GetResponse.is(definition)) {
    badges.push(<WiredStreamBadge />);
  }

  return (
    <EuiFlyout aria-label={name} onClose={onClose}>
      <EuiPageTemplate.Header
        pageTitle={
          <>
            {name} {badges}
          </>
        }
        tabs={tabs}
      />
      <EuiFlyoutBody>
        <EuiPageTemplate.Section paddingSize="none">
          {loading ? (
            <EuiFlexGroup justifyContent="center" alignItems="center">
              <EuiLoadingSpinner size="xxl" />
            </EuiFlexGroup>
          ) : (
            page
          )}
        </EuiPageTemplate.Section>
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
      <StreamInnerBody name={name} onClose={onClose} />
    </StreamFlyoutDetailContextProvider>
  );
}
