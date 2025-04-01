import {TappdClient} from '@phala/dstack-sdk'

export const dynamic = 'force-dynamic'

export async function POST(_request: Request) {
  const client = new TappdClient()
  const getRemoteAttestation = await client.tdxQuote("Hello DStack!", "raw");
  return Response.json(getRemoteAttestation);
}
