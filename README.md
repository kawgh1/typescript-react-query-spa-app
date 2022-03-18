-   # React Query in a Larger App

-   This project is based off a course by Bonnie Schulkin
-   https://www.udemy.com/course/learn-react-query/

-   **Server running on: localhost:3030**
-   **App running on localhost:3000**
-   ### Typescript
-   centralizing fetching indicator / error handling
-   refetching data
-   integrating with auth
-   dependent queries
-   testing
-   more examples of `useQuery`, mutations, pagination, prefetching

-   ### Notes

    -   This app is NOT responsive, best used in full browser window

    -   ### Custom `useQuery` Hooks

        -   In larger apps it is common to make a custom hook for each type of data retrieved from a server
        -   can access the `useQuery` hook from multiple components
        -   no risk of mixing up keys
        -   query function encapsulated in custom hook
        -   **abstracts the implementation layer from the display layer**
            -   update the hook, not the display, if you want to change implementation
        -   reference: https://react-query.tanstack.com/examples/custom-hooks

    -   ### Query Keys

                File: src/react-query/constants

                export const queryKeys = {

                    treatments: 'treatments',
                    appointments: 'appointments',
                    user: 'user',
                    staff: 'staff',
                };

        -   using pre-defined query keys in our `useQuery` hooks allows us to be consistent across app components

                File: src/treatments/hooks/useTreatments.js


                // query function for useQuery

                const getTreatments = async (): Promise<Treatment[]> => {
                    const { data } = await axiosInstance.get( '/treatments' );
                    return data;
                };

                export const useTreatments = (): Treatment[] => {
                    // TODO: get data from server via useQuery

                    // queryKeys.treatments = 'treatments'
                    const { data } = useQuery( queryKeys.treatments, getTreatments );
                    return data;
                };

    -   ### `useIsFetching`

        -   in smaller apps
            -   used `isFetching` from `useQuery` return object
            -   Reminder: `isLoading` **is** `isFetching` _plus_ no cached data
        -   in larger apps
            -   Loading spinner whenever **_any_** query `isFetching`
            -   `useIsFetching` is a magical hook that tells us if **_any_** hook is still fetching
            -   we will create a centralized error handling that **all** of our custom hooks / `useQuery` calls will pull from to display while loading/ fetching
        -   **No need for `isFetching` on every custom hook / `useQuery` call**
        -   see `src/components/app/Loading.tsx`

                export const Loading = (): ReactElement => {
                    // will use React Query `useIsFetching` to determine whether or not to display loading spinner

                    const isFetching = useIsFetching();

                    // useIsFetching returns a number representing the number of query calls that are currently in the `fetching` state

                    // if useIsFetching > 0, then it will evaluate to `true`

                    const display = isFetching ? 'inherit' : 'none';

                    return (

                        <Spinner>
                            <Text display="none">Loading...</Text>
                        </Spinner>
                    );
                }

    -   ### Passing errors to toasts
        -   Pass `useQuery` errors to Chakra UI "toast"
            -   First for single call, then centralized for all `useQuery` calls
        -   `onError` callback to `useQuery`
            -   Instead of destructuring `isError, error` from `useQuery` return
            -   Error handling callback runs if query functions throw an error
            -   `error` parameter to callback
    -   Will use toasts

        -   Chakra UI comes with a handy useToast hook

            -   `src/components/app/hooks/useCustomToast.tsx`
            -   https://chakra-ui.com/docs/feedback/toast

                        File: src/components/treatments/hooks/useTreatments.ts

                        // for when we need a query function for useQuery
                        const getTreatments = async (): Promise<Treatment[]> => {
                            const { data } = await axiosInstance.get('/treatments');
                            return data;
                        };

                        export const useTreatments = (): Treatment[] => {

                            const toast = useCustomToast();

                            const fallback = [];

                            const { data = fallback } = useQuery(queryKeys.treatments, getTreatments, {
                                onError: (error) => {
                                const title =
                                    error instanceof Error
                                    ? error.message
                                    : 'Error connecting to the server';
                                toast({ title, status: 'error' });
                                },
                            });
                            return data;

                            };

    -   ### Setting default `onError` handler for our Query Client

        -   defaults for QueryClient
        -   https://github.com/tannerlinsley/react-query/blob/master/src/core/types.ts

            {
            queries: { useQuery options },
            mutations: { useMutation options }
            }

                    File: src/components/react-query/queryClient.ts

                    ...
                    const queryErrorHandler = (error: unknown): void => {

                        // error is type unknown because in js, anything can be an error (e.g. throw(5))

                        const id = 'react-query-error';
                        const title =
                            error instanceof Error ? error.message : 'error connecting to server';

                        // prevent duplicate toasts
                        toast.closeAll();
                        toast({ id, title, status: 'error', variant: 'subtle', isClosable: true });

                    }

                        // here we establish the defaultOptions of our QueryClient to include the onError handler

                        export const queryClient = new QueryClient({
                            defaultOptions: {
                                queries: {
                                    onError: queryErrorHandler,
                                },
                            },

                        });

![error-handling-react-query](https://raw.githubusercontent.com/kawgh1/typescript-react-query-spa-app/main/error-handling.png)

-   ### Alternative to `onError` Handler: Error Boundary

    -   Alternative: handle errors with React Error Boundary
        -   https://reactjs.org/docs/error-boundaries.html
    -   `useErrorBoundary` for `useQuery`
        -   reference: https://react-query.tanstack.com/reference/useQuery
    -   option to `useQuery` / `useMutation`
        -   or in `defaultOptions` when creating QueryClient
    -   if you set error boundary propagation property to `true`, it will propagate errors to the nearest error boundary

-   ### Options for pre-populating data

|                   | where to use?           | data from? | added to cache? |
| ----------------- | ----------------------- | ---------- | --------------- |
| `prefetchQuery`   | method to `queryClient` | server     | yes             |
| `setQueryData`    | method to `queryClient` | client     | yes             |
| `placeholderData` | option to `useQuery`    | client     | no              |
| `initialData`     | option to `useQuery`    | client     | yes             |

-   ### Prefetch Treatments (this app)

    -   For this app, we want to prefetch the Treatments on home page load, even tho Treatments are only visible on the Treatments page/component
        -   ex.) user research said 85% of home page loads are followed by user clicking to view the treatments tab (reasonable given the product service)
        -   **Treatments don't change often - ie. the data is stable - so cached data isn't really necessary**
    -   garbage collected if no `useQuery` is called after `cacheTime`
        -   if not loaded by default `cacheTime` (5 minutes), specify a longer cacheTime
    -   `prefetchQuery` is a method on the `queryClient` - it runs once
        -   adding to the client cache
    -   `useQueryClient` returns `queryClient` (with Provider)
    -   We will create a `usePrefetchTreatments` hook within `useTreatments.ts`
        -   uses the same query function and key as the `useTreatment` call
        -   call `usePrefetchTreatments` from the Home component
            -   As long as user clicks on 'Treatments' tab before `cacheTime` expires (5 minutes), then they won't have to wait on the server call to get the Treatments from the server because the data will already be in the cache from the prefetch

-   ### useAppointment

    -   ### If the data is going to change (ie, appointments for each month) make sure your query key changes to fetch that new data
        -   Otherwise you will be getting the same data (appointments) for each month
        -   This is why **dependency arrays** in our query keys is important, they must be unique for each query if the data changes

-   ### Filtering with the `select` option
    -   Allow user to filter out any appointments that aren't available
