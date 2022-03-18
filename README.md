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
        -   ` const { data } = useQuery( queryKeys.treatments, getTreatments );`
