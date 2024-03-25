import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";

const httpLink = createHttpLink({
  uri: "/api/graphql/proxy",
  headers: {},
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export const getServerClient = (uri: string, admin_secret: string) => {
  const client = new ApolloClient({
    link: new HttpLink({
      uri,
      headers: {
        "x-hasura-admin-secret": admin_secret,
      },
      fetch,
    }),
    cache: new InMemoryCache(),
  });

  return client;
};

export default client;
