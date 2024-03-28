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

// Helper functions for validation
const isValidEmail = (email: string) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
  return re.test(String(email).toLowerCase());
};

const isValidPassword = (password: string) => {
  return password.length >= 8; // Just an example, consider adding more checks
};

const isValidUsername = (username: string) => {
  return username.length >= 3 && username.length <= 20; // Example constraints
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { email, password, username } = req.body;

  // Validations
  if (!email || !password || !username) {
    return res
      .status(400)
      .json({ error: "Email, password, and username are required." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }
  if (!isValidPassword(password)) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long." });
  }
  if (!isValidUsername(username)) {
    return res
      .status(400)
      .json({ error: "Username must be between 3 and 20 characters long." });
  }

  // Hash the password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const client = getServerClient(
    process.env.HASURA_PROXY as string,
    process.env.HASURA_PRIVAT_SECRET as string
  );

  try {
    const { data } = await client.mutate({
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
