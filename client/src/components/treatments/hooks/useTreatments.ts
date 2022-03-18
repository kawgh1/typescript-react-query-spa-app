// react query
import { useQuery } from 'react-query';

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

  const { data = fallback } = useQuery(queryKeys.treatments, getTreatments);

  return data;
};
