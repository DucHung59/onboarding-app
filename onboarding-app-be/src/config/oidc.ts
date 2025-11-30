import { Issuer, Client } from "openid-client";

let client: Client | null = null;

export async function createOidcClient(): Promise<Client> {
  if (client) return client;

  const issuer = await Issuer.discover(process.env.OIDC_ISSUER!);

  client = new issuer.Client({
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    redirect_uris: [process.env.REDIRECT_URI!],
    response_types: ["code"]
  });

  return client;
}
