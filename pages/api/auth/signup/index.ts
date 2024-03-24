import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { gql } from "@apollo/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerClient } from "@/components/graphql/client/client";

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($email: String!, $password: String!, $username: String!) {
    insert_appv3_user_one(
      object: { email: $email, password: $password, username: $username }
    ) {
      id
      email
      username
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res
      .status(400)
      .json({ error: "Email, password, and username are required." });
  }

  // Hash the password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const client = getServerClient(
    process.env.HASURA_PROXY as string,
    process.env.HASURA_ADMIN_SECRET as string
  );

  try {
    await client.mutate({
      mutation: CREATE_USER_MUTATION,
      variables: {
        email,
        password: hashedPassword,
        username,
      },
    });

    // Create JWT token or handle user creation response here
    const token = jwt.sign({ email }, process.env!.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
