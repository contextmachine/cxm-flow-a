// pages/api/signin.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByEmail } from "./__get-user-email";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    // Retrieve user from the database or external service
    const user = await getUserByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json({ message: "User with this email was not found" });
    }
    // Verify password
    const isValid = bcrypt.compareSync(password, user.password);

    if (!isValid) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env!.JWT_SECRET as string,
      { expiresIn: "2d" } // Expires in 2 days
    );

    // Send the token to the client
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
