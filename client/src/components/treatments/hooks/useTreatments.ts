// react query
import { useQuery, useQueryClient } from 'react-query';

import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';

// query function for useQuery
const getTreatments = async (): Promise<Treatment[]> => {
  const { data } = await axiosInstance.get('/treatments');
  return data;
};

export const useTreatments = (): Treatment[] => {
  const toast = useCustomToast();

  const fallback = [];
  // get data from server via useQuery

  // we manage error handling by default in src/react-query/queryClient.ts

  // const { data = fallback } = useQuery(queryKeys.treatments, getTreatments, {
  //   onError: (error) => {
  //     const title =
  //       error instanceof Error
  //         ? error.message
  //         : 'Error connecting to the server';
  //     toast({ title, status: 'error' });
  //   },
  // });

  const { data = fallback } = useQuery(queryKeys.treatments, getTreatments, {
    staleTime: 60000, // 10 minutes
    cacheTime: 90000, // 15 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return data;
};

// Prefetch Treatments hook
// return type is 'void' because it doesn't return anything, it only populates the cache

export const usePrefetchTreatments = (): void => {
  const queryClient = useQueryClient();

  // set staleTime for this instance to be 5 minutes so that the stale data from pre-fetch
  // does not trigger a re-fetch when user clicks Treatments tab
  // https://react-query.tanstack.com/reference/QueryClient#queryclientsetquerydefaults
  // queryClient.setDefaultOptions({
  //   queries: {
  //     staleTime: 60000,
  //   },
  // });
  // prefetch call
  queryClient.prefetchQuery(queryKeys.treatments, getTreatments, {
    staleTime: 60000,
  });
};
