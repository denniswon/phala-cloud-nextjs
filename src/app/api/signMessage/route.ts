import { TappdClient } from '@phala/dstack-sdk';
import { toViemAccount } from '@phala/dstack-sdk/viem';
import { Keypair } from '@solana/web3.js';
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts';

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const res = await request.json()
  const message = res.message;
  let key = res.key;
  const useSol = !!res.useSol;
  if (!key) {
    if (useSol) {
      const keypair = Keypair.generate();
      key = keypair.publicKey.toBase58()
    } else {
      key = privateKeyToAddress(generatePrivateKey())
    }
  }
  const client = new TappdClient()
  const deriveKey = await client.deriveKey(key);
  const account = toViemAccount(deriveKey);
  console.log(`Account [${account.address}] Signing Message [${message}]`);
  const signature = await account.signMessage({ message });
  console.log(`Message Signed [${signature}]`)
  return Response.json({ address: account.address, message: message, signature: signature });
}
