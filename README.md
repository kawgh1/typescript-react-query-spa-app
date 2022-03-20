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
    -   why is the `select` option the best way to do this?
        -   React-query memo-izes to reduce unnecessary computation
        -   tech details:
            -   triple equals comparison of `select` function
            -   only runs if data changes **_and_** the function has changed
        -   need a stable function (`useCallback` for anonymous function)
        -   reference: https://tkdodo.eu/blog/react-query-data-transformations
    -   State of whether filter is on, whether user is filtering out appointments, is contained in hook (like `monthYear`)
    -   filter function in `src/components/appointments/utils.ts`
        -   `getAvailableAppointments`
    -   ### Note: `select` is not an option for prefetchQueries, just normal useQueries
    -   the `select` option is implemented in `useAppointments` and `useStaff` hooks to handle filtering
        -   In useAppointments - the `select` option runs a select function that filters and shows only available appointments
        -   In useStaff - the `select` option runs a select function that filters staff by the different treatments they offer (facial, scrub, massage, etc.)

-   ### Re-Fetching options

          const { data = fallback } = useQuery(queryKeys.treatments, getTreatments, {
              staleTime: 600000, // 10 minutes
              cacheTime: 900000, // 15 minutes
              refetchOnMount: false,
              refetchOnWindowFocus: false,
              refetchOnReconnect: false,
          });

    -   you would set these properties - long `staleTime` and `cacheTime`, no `refetchOnMount`, no `refetchOnWindowFocus`, etc. - when the data you are displaying isn't going to change
    -   So in our app - the Staff and the Treatments aren't going to change very often
        -   BUT, our Appointments data will change, so we want to be careful and make sure that data is super fresh all the time
    -   Another example of constantly changing data would be like stock prices or weather or traffic conditions

-   ### Polling / Auto Re-Fetching

    -   The Appointments data needs to be kept fresh, even if the user takes no action
    -   **It is likely that available appointments will change on the server while the user is on the site**
    -   use `refetchInterval` option on `useQuery`
        -   reference: https://react-query.tanstack.com/examples/auto-refetching

    const { data: appointments = fallback } = useQuery(

        [queryKeys.appointments, monthYear.year, monthYear.month],
        () => getAppointments(monthYear.year, monthYear.month),

        {
        select: showAll ? undefined : selectFn,
        staleTime: 0,
        cacheTime: 300000, // default (5 minutes)
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchInterval: 60000, // refetch all appointments every 1 minute
        },

    );

-   ## React Query and Auth

    -   # Note: This app does not use ContextAPI so user state is managed by hand with custom useUser and useAuth hooks. Using ContextAPI would be simpler I think.
    -   But a good example of how to handle user Auth by hand
    -   # Note: This app stores sensitive user data in `LocalStorage` to persist that user data on page refresh - this is VERY UNSECURE.
    -   https://www.rdegges.com/2018/please-stop-using-local-storage/
    -   He recommends only storing a `sessionId` in local storage for the user and using a backend or API to handle the rest - obviously this is more complex, but necessary for commercial apps
    -   can also use third party cloud-auth providers like OAuth

    -   ### Dependent Queries, `setQueryData`, `removeQueries`

-   ### JWT Authentication

    -   This app use JWT (JSON Web Token) authentication
        -   Other apps might use Firebase / Amplify / some other cloud-based auth
    -   JWT
        -   Server sends token to Client on successful login or user creation
        -   Client sends token in headers with requests as proof of identity so that the Server knows this Client is authorized
    -   Security
        -   Token contains encoded info such as the username and user ID
        -   Decoded and matched on the Server
    -   In this app, the JWT is stored in the user object
        -   Persisted in localStorage
        -   Your auth system may use a different way to persist data between sessions

-   ### React Query and Auth

    -   Who should "own" the user data, `useAuth` or `useQuery`?
        -   Should `useAuth` call `useQuery` or make the axios call directly?
        -   Should `useAuth` have a provider, a context, that stores Auth data, or store user data in React Query cache?
    -   ### Separation of Concerns
        -   **It helps to think about the specific responsibilities of React Query vs the `useAuth` hook**
        -   React Query's responsibility is to maintain the Server State on the React Client
        -   `useAuth`'s responsibility is to provide functions for sign in, sign out and sign up - to authenticate the user on the Server
        -   **Conclusion:** It makes sense for React Query to store the user data via `useUser` but `useAuth` will help out because it will collect user data from calls to the Server and add to cache

-   ### Role of `useUser`

    -   Returns `user` data from React Query to the cache
        -   On initialization, we'll load that data from `LocalStorage` (to maintain data if user refreshes the page)
    -   Keep user data up to date - for instance, when a mutation happens - with server via `useQuery`
    -   The request of this `useQuery` will send the ID of the logged in user and then we'll get the data for that user back from the Server
        -   If there is no logged in user, the function will just return `null`
    -   Whenever user updates (sign in, sign out, mutation) we will update the React Query cache **directly** with `setQueryData`
        -   Then we'll also update `LocalStorage` with `onSuccess` callback to `useQuery`
            -   `onSuccess` runs after:
                -   `setQueryData`
                -   query function
            -   So that user data gets updated either way with `onSuccess` being called, whether `setQueryData` is called or if any React Query function is called, like a mutation

-   ### Why not just store user data in an Auth provider?

    -   Definitely a common option
    -   Disadvantage is added complexity
        -   It involves maintain a separate Provider (Context) from the React Query cache
        -   Going to be some redundant data - if allowing for user mutations or user data in both React Query **_and_** a dedicated Auth Provider
    -   If starting a fresh application - easier to store user data in React Query cache and abandon Auth Provider
    -   If in a Legacy application - may be more expedient to maintain both

-   ### Code

    -   Check out `src/auth/useAuth` and `src/components/user/hooks/useUser`
    -   `useUser`'s responsibility is to maintain the user state both in `LocalStorage` and in the React Query cache
    -   `useAuth`'s responsibility is to provide the functions (signin, signup, signout) that communicate with the Server

-   ### Set React Query Cache values in `useAuth`

    -   React Query acting as a provider for auth
    -   In order to set the value in the Query Cache, we use `queryClient.setQueryData` which takes a query key, a value, and sets the query key as that value in the Query Cache
    -   Add this `queryClient.setQueryData` data calls to `updateUser` and `clearUser` in the `useUser` hook
        -   `useAuth` also calls these functions

-   ### Setting Initial Value in React Query Cache

    -   React Query team is working on plugins to help persist React Query cache data between sessions and refresh, however they are all still 'experimental' and should not be used
        -   `persistQueryClient` (Experimental)
        -   `createWebStoragePersistor`(Experimental)
        -   `createAsyncStoragePersistor` (Experimental)
        -   `broadcastQueryClient` (Experimental)
        -   can't even access these pages in the React Query docs
        -   https://react-query.tanstack.com/overview
    -   In our App, we will use `initialData` value in `useQuery`
        -   For use when you want initial value to be added to React Query Cache
        -   For placeholder, use `placeholderData` or default destructured value
    -   Initial value will come from `LocalStorage`
    -   https://react-query.tanstack.com/guides/initial-query-data#using-initialdata-to-prepopulate-a-query

            export function useUser(): UseUser {

                // establish queryClient

                const queryClient = useQueryClient();

                // call useQuery to update user data from server
                // we set the value of user in the Query cache (queryKeys.user) from our useAuth hook so that user 'data' wont be null here

                const { data: user } = useQuery(queryKeys.user, () => getUser(user), {

                    // get user object from LocalStorage if exists
                    initialData: getStoredUser,

                    // onSuccess callback
                    onSuccess: (received: User | null) => {
                        if (!received) {
                            clearStoredUser();
                        } else {
                            setStoredUser(received);
                        }
                    },
                });

-   ### Dependent Queries
    -   This app is going to have a separate query for user appointments
        -   that is, the user appointments are going to have their own query, separate from the user query
        -   This is because the user appointment data is going to change more frequently than the actual user data
        -   A bit much for this app, but a good example of demonstrating dependent queries for more complex cases
    -   Call `useQuery` in `useUserAppointments`
        -   For now, use key `'user-appointments'`
        -   But will change to use query key prefixes when we start using mutations on the appointments
            -   Query Key Prefixes are useful if you want to invalidate a lot of queries at once, or adjust the many queries at once with new data or whatever
    -   ### Make the query _dependent_ on `user` being truthy
        -   dependent queries will only run if `user` is NOT null
    -   reference: https://react-query.tanstack.com/guides/dependent-queries
