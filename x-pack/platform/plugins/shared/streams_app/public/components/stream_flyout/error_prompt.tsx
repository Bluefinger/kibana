/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { i18n } from '@kbn/i18n';
import { EuiEmptyPrompt } from '@elastic/eui';

export function ErrorPrompt() {
  return (
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
}
