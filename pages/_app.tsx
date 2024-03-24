import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import client from "@/components/graphql/client/client";
import { AuthProvider } from "@/components/services/auth-service/auth-provider";
import GlobalStyle from "@/components/ui/app.styled";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <ApolloProvider client={client}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ApolloProvider>

      <GlobalStyle />
    </>
  );
};

export default App;
