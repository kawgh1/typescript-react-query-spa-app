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
            -   https://chakra-ui.com/docs/feedback/toast
