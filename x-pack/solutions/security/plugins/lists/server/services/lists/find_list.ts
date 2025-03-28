/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { MappingRuntimeFields } from '@elastic/elasticsearch/lib/api/types';
import { ElasticsearchClient } from '@kbn/core/server';
import type {
  Filter,
  FoundListSchema,
  Page,
  PerPage,
  SortFieldOrUndefined,
  SortOrderOrUndefined,
} from '@kbn/securitysolution-io-ts-list-types';

import { SearchEsListSchema } from '../../schemas/elastic_response';
import {
  encodeCursor,
  getQueryFilter,
  getSearchAfterWithTieBreaker,
  getSortWithTieBreaker,
  scrollToStartPage,
  transformElasticToList,
} from '../utils';

interface FindListOptions {
  filter: Filter;
  currentIndexPosition: number;
  searchAfter: string[] | undefined;
  perPage: PerPage;
  page: Page;
  sortField: SortFieldOrUndefined;
  sortOrder: SortOrderOrUndefined;
  esClient: ElasticsearchClient;
  listIndex: string;
  runtimeMappings: MappingRuntimeFields | undefined;
}

export const findList = async ({
  esClient,
  currentIndexPosition,
  filter,
  page,
  perPage,
  searchAfter,
  sortField,
  listIndex,
  sortOrder,
  runtimeMappings,
}: FindListOptions): Promise<FoundListSchema> => {
  const query = getQueryFilter({ filter });

  const scroll = await scrollToStartPage({
    currentIndexPosition,
    esClient,
    filter,
    hopSize: 100,
    index: listIndex,
    page,
    perPage,
    runtimeMappings,
    searchAfter,
    sortField,
    sortOrder,
  });

  const totalCount = await esClient.count({
    ignore_unavailable: true,
    index: listIndex,
    query,
  });

  if (scroll.validSearchAfterFound) {
    // Note: This typing of response = await esClient<SearchResponse<SearchEsListSchema>>
    // is because when you pass in seq_no_primary_term: true it does a "fall through" type and you have
    // to explicitly define the type <T>.
    const response = await esClient.search<SearchEsListSchema>({
      ignore_unavailable: true,
      index: listIndex,
      query,
      search_after: scroll.searchAfter,
      seq_no_primary_term: true,
      size: perPage,
      sort: getSortWithTieBreaker({ sortField, sortOrder }),
    });
    return {
      cursor: encodeCursor({
        page,
        perPage,
        searchAfter: getSearchAfterWithTieBreaker({ response, sortField }),
      }),
      data: transformElasticToList({ response }),
      page,
      per_page: perPage,
      total: totalCount.count,
    };
  } else {
    return {
      cursor: encodeCursor({ page, perPage, searchAfter: undefined }),
      data: [],
      page,
      per_page: perPage,
      total: totalCount.count,
    };
  }
};
