// Assuming you've set up Apollo Client as shown in your previous messages
import { getServerClient } from "@/components/graphql/client/client";
import { gql } from "@apollo/client";

const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    appv3_user(where: { email: { _eq: $email } }) {
      id
      username
      email
      password
    }
  }
`;

export async function getUserByEmail(email: string) {
  const client = getServerClient(process.env.HASURA_PROXY as string, process.env.HASURA_PRIVAT_SECRET as string);

  try {
    const { data } = await client.query({
      query: GET_USER_BY_EMAIL,
      variables: { email },
    });

    return data.appv3_user.length ? data.appv3_user[0] : null; 
  } catch (error) {
    console.error("Error fetching user by email", error);
    throw error;
  }
}
