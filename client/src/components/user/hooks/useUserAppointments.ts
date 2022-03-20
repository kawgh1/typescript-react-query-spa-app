import dayjs from 'dayjs';
import { useQuery } from 'react-query';

import type { Appointment, User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useUser } from './useUser';

// query function for useQuery
const getUserAppointments = async (
  user: User | null,
): Promise<Appointment[] | null> => {
  if (!user) return null;
  const { data } = await axiosInstance.get(`/user/${user.id}/appointments`, {
    headers: getJWTHeader(user),
  });
  return data.appointments;
};

export function useUserAppointments(): Appointment[] {
  // define user
  const { user } = useUser();
  // fallback
  const fallback: Appointment[] = [];
  // replace with React Query
  const { data: userAppointments = fallback } = useQuery(
    'user-appointments',
    () => getUserAppointments(user),
    { enabled: !!user }, // 'enabled' takes a boolean !!user returns true is user exists
  );
  return userAppointments;
}
