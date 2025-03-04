/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFilterGroup, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { isEqual } from 'lodash/fp';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import type { RuleCustomizationStatus } from '../../../../../../common/api/detection_engine';
import { usePrebuiltRulesCustomizationStatus } from '../../../../rule_management/logic/prebuilt_rules/use_prebuilt_rules_customization_status';
import { RuleSearchField } from '../rules_table_filters/rule_search_field';
import { TagsFilterPopover } from '../rules_table_filters/tags_filter_popover';
import * as i18n from './translations';
import { useUpgradePrebuiltRulesTableContext } from './upgrade_prebuilt_rules_table_context';
import { RuleCustomizationFilterPopover } from './upgrade_rule_customization_filter_popover';

const FilterWrapper = styled(EuiFlexGroup)`
  margin-bottom: ${({ theme }) => theme.eui.euiSizeM};
`;

/**
 * Collection of filters for filtering data within the Upgrade Prebuilt Rules table.
 * Contains search bar and tag selection
 */
const UpgradePrebuiltRulesTableFiltersComponent = () => {
  const {
    state: { filterOptions, tags },
    actions: { setFilterOptions },
  } = useUpgradePrebuiltRulesTableContext();

  const { isRulesCustomizationEnabled } = usePrebuiltRulesCustomizationStatus();

  const { tags: selectedTags, customization_status: customizationStatus } = filterOptions;

  const handleOnSearch = useCallback(
    (nameString: string) => {
      setFilterOptions((filters) => ({
        ...filters,
        name: nameString.trim(),
      }));
    },
    [setFilterOptions]
  );

  const handleSelectedTags = useCallback(
    (newTags: string[]) => {
      if (!isEqual(newTags, selectedTags)) {
        setFilterOptions((filters) => ({
          ...filters,
          tags: newTags,
        }));
      }
    },
    [selectedTags, setFilterOptions]
  );

  const handleCustomizationStatusChange = useCallback(
    (newCustomizationStatus: RuleCustomizationStatus | undefined) => {
      setFilterOptions((filters) => ({
        ...filters,
        customization_status: newCustomizationStatus,
      }));
    },
    [setFilterOptions]
  );

  return (
    <FilterWrapper gutterSize="s" justifyContent="flexEnd" wrap>
      <RuleSearchField
        initialValue={filterOptions.name ?? ''}
        onSearch={handleOnSearch}
        placeholder={i18n.SEARCH_PLACEHOLDER}
      />
      <EuiFlexItem grow={false}>
        <EuiFlexGroup gutterSize="s">
          {isRulesCustomizationEnabled && (
            <EuiFilterGroup>
              <RuleCustomizationFilterPopover
                onCustomizationStatusChanged={handleCustomizationStatusChange}
                customizationStatus={customizationStatus}
                data-test-subj="upgradeRulesRuleCustomizationPopover"
              />
            </EuiFilterGroup>
          )}
          <EuiFilterGroup>
            <TagsFilterPopover
              onSelectedTagsChanged={handleSelectedTags}
              selectedTags={selectedTags ?? []}
              tags={tags}
              data-test-subj="upgradeRulesTagPopover"
            />
          </EuiFilterGroup>
        </EuiFlexGroup>
      </EuiFlexItem>
    </FilterWrapper>
  );
};

UpgradePrebuiltRulesTableFiltersComponent.displayName = 'UpgradePrebuiltRulesTableFiltersComponent';

export const UpgradePrebuiltRulesTableFilters = React.memo(
  UpgradePrebuiltRulesTableFiltersComponent
);

UpgradePrebuiltRulesTableFilters.displayName = 'UpgradePrebuiltRulesTableFilters';
