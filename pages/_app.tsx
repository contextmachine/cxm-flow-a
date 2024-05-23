import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import client from "@/components/graphql/client/client";
import { AuthProvider } from "@/components/services/auth-service/auth-provider";
import { WorkspaceProvider } from "@/components/services/workspace-service/workspace-provider";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <ApolloProvider client={client}>
        <AuthProvider>
          <WorkspaceProvider>
            <Component {...pageProps} />
          </WorkspaceProvider>
        </AuthProvider>
      </ApolloProvider>
    </>
  );
};

export default App;
