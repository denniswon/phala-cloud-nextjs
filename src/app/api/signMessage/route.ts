import { TappdClient } from '@phala/dstack-sdk';
import { toKeypair } from '@phala/dstack-sdk/solana';
import { toViemAccount } from '@phala/dstack-sdk/viem';
import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import nacl_util from 'tweetnacl-util';
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const res = await request.json();
  const message = res.message;
  let key = res.key;
  const chain = res.chain;
  console.log('sign message:', res);
  if (!key) {
    if (chain === 'solana') {
      const keypair = Keypair.generate();
      key = keypair.publicKey.toBase58();
    } else {
      key = privateKeyToAddress(generatePrivateKey());
    }
  }
  const client = new TappdClient();
  const deriveKey = await client.deriveKey(key);

  if (chain === 'solana') {
    const account = toKeypair(deriveKey);
    console.log(
      `Account [${account.publicKey.toBase58()}] Signing Message [${message}]`
    );
    const messageBytes = nacl_util.decodeUTF8(message);
    const signature = nacl.sign.detached(messageBytes, account.secretKey);
    console.log(`Message Signed [${signature}]`);
    return Response.json({
      address: account.publicKey.toBase58(),
      message: message,
      signature: signature,
    });
  } else {
    const account = toViemAccount(deriveKey);
    console.log(`Account [${account.address}] Signing Message [${message}]`);
    const signature = await account.signMessage({ message });
    console.log(`Message Signed [${signature}]`);
    return Response.json({
      address: account.address,
      message: message,
      signature: signature,
    });
  }
}
