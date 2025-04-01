import { TappdClient } from '@phala/dstack-sdk'
import { toKeypair } from '@phala/dstack-sdk/solana'
import { toViemAccount } from '@phala/dstack-sdk/viem'
import { Keypair } from '@solana/web3.js'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const res = await request.json()
  let key = res.key;
  const useSol = !!res.useSol;
  console.log(res);
  if (!key) {
    if (useSol) {
      console.log('Generating Solana key...');
      const keypair = Keypair.generate();
      key = keypair.publicKey.toBase58()
    } else {
      console.log('Generating Ethereum key...');
      key = privateKeyToAddress(generatePrivateKey())
    }
  }
  const client = new TappdClient()
  const deriveKey = await client.deriveKey(key);
  if (useSol) {
    const account = toKeypair(deriveKey);
    console.log(account);
    return Response.json({ address: account.publicKey.toBase58() });
  } else {
    const account = toViemAccount(deriveKey);
    console.log(account);
    return Response.json({ address: account.address });
  }
}
