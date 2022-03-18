import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useQuery } from 'react-query';

import type { Staff } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { filterByTreatment } from '../utils';

// query function for useQuery
const getStaff = async (): Promise<Staff[]> => {
  const { data } = await axiosInstance.get('/staff');
  return data;
};

interface UseStaff {
  staff: Staff[];
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
}

export const useStaff = (): UseStaff => {
  // for filtering staff by treatment
  const [filter, setFilter] = useState('all');

  // FILTERING
  const selectFn = useCallback(
    (unfilteredStaff) => filterByTreatment(unfilteredStaff, filter),
    [filter],
  );

  // MAIN QUERY
  // get data from server via useQuery
  const fallback = [];
  const { data: staff = fallback } = useQuery(queryKeys.staff, getStaff, {
    select: filter === 'all' ? undefined : selectFn, // undefined just means, do nothing, ignore the select function
  });

  return { staff, filter, setFilter };
};
