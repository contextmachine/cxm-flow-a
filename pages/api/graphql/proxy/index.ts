import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const requireHeaders = {
    "x-hasura-admin-secret": process.env.HASURA_PRIVAT_SECRET
      ? process.env.HASURA_PRIVAT_SECRET
      : "",
  };

  const method = req.method ? req.method : "GET";
  if (process.env.HASURA_PROXY) {
    if (method === "GET" || method === "HEAD" || method === "GET/HEAD") {
     
      const response = await fetch(process.env.HASURA_PROXY, {
        method: req.method,
        headers: requireHeaders,
      });

      res.status(response.status).write(await response.text());
    } else {
    
      const response = await fetch(process.env.HASURA_PROXY, {
        method: req.method,
        headers: requireHeaders,
        body: JSON.stringify(req.body),
      });

      res.status(response.status).json(await response.json());
    }
  } else {
    res.status(400).json({
      reason: "NEXT_PUBLIC_GRAPHQL_URI is undefined",
    });
  }
}
