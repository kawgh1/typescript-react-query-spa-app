// react query
import { useQuery } from 'react-query';

import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';

// for when we need a query function for useQuery
const getTreatments = async (): Promise<Treatment[]> => {
  const { data } = await axiosInstance.get('/treatments');
  return data;
};

export const useTreatments = (): Treatment[] => {
  // TODO: get data from server via useQuery

  // queryKeys.treatments = 'treatments'
  const { data } = useQuery(queryKeys.treatments, getTreatments);
  return data;
};
