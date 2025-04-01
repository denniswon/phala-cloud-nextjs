import { TappdClient } from '@phala/dstack-sdk'
import { toViemAccount } from '@phala/dstack-sdk/viem'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const res = await request.json()
  let key = res.key;
  console.log(res);
  if (!key) {
    console.log('Generating Ethereum key...');
    key = privateKeyToAddress(generatePrivateKey())
  }
  const client = new TappdClient()
  const deriveKey = await client.deriveKey(key);
  const account = toViemAccount(deriveKey);
  console.log(account);
  return Response.json({ address: account.address });
}
