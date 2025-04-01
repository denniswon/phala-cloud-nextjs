import { TappdClient } from '@phala/dstack-sdk'
import { toKeypair } from '@phala/dstack-sdk/solana'
import { toViemAccount } from '@phala/dstack-sdk/viem'
import { Keypair } from '@solana/web3.js'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const res = await request.json()
  let key = res.key;
  console.log(res);
  if (!key) {
    console.log('Generating Solana key...');
    key = Keypair.generate().publicKey.toBase58()
  }
  const client = new TappdClient()
  const deriveKey = await client.deriveKey(key);
  const account = toKeypair(deriveKey);
  console.log(account);
  return Response.json({ address: account.publicKey.toBase58() });
}
