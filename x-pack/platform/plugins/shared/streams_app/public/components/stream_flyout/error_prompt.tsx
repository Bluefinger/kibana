/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { i18n } from '@kbn/i18n';
import { EuiButton, EuiEmptyPrompt } from '@elastic/eui';

export function ErrorPrompt({ onClose }: { onClose: () => void }) {
  return (
    <EuiEmptyPrompt
      iconType="search"
      title={
        <h2>
          {i18n.translate('xpack.streams.flyout.error.title', {
            defaultMessage: 'Stream not found',
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
      actions={
        <EuiButton data-test-subj="streamNotFoundCloseButton" fill onClick={onClose}>
          {i18n.translate('xpack.streams.flyout.error.closeButton', {
            defaultMessage: 'Go back to stream canvas',
          })}
        </EuiButton>
      }
    />
  );
}
