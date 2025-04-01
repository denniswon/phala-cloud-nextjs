import { TappdClient } from '@phala/dstack-sdk';
import { toKeypair } from '@phala/dstack-sdk/solana';
import { toViemAccount } from '@phala/dstack-sdk/viem';
import { requestAndConfirmAirdrop } from '@solana-developers/helpers';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import superjson from 'superjson';
import { createPublicClient, createWalletClient, http, parseGwei } from 'viem';
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const res = await request.json();
  let key = res.key;
  const chain = res.chain;
  console.log('sign transaction:', res);
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
    const keypair = toKeypair(deriveKey);
    const sender = keypair.publicKey;
    const connection = new Connection(
      'https://api.devnet.solana.com',
      'confirmed'
    );

    await requestAndConfirmAirdrop(connection, sender, 2 * LAMPORTS_PER_SOL);

    const transaction = new Transaction();

    const LAMPORTS_TO_SEND = 1;
    const toPubkey = new PublicKey(
      'BivSgJtLQcVzxmNCPX1xG8w2wFJhqsmUWdsz97udzwGT'
    );
    const sendSolInstruction = SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey,
      lamports: LAMPORTS_PER_SOL * LAMPORTS_TO_SEND,
    });

    transaction.add(sendSolInstruction);

    let result = {
      derivedPublicKey: sender.toBase58(),
      to: toPubkey.toBase58(),
      lamports: LAMPORTS_TO_SEND,
      signature: '',
    };

    try {
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [keypair]
      );
      result.signature = signature;

      console.log(
        `💸 Finished! Sent ${LAMPORTS_TO_SEND} to the address ${toPubkey}. `
      );
      console.log(`Transaction signature is ${signature}!`);

      const { json: jsonResult, meta } = superjson.serialize(result);
      return Response.json({
        jsonResult,
      });
    } catch (e) {
      return Response.json({ error: e });
    }
  } else {
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });
    const walletClient = createWalletClient({
      chain: baseSepolia,
      transport: http(),
    });
    const account = toViemAccount(deriveKey);
    const to = '0xC5227Cb20493b97bb02fADb20360fe28F52E2eff';
    const gweiAmount = 420;
    let result = {
      derivedPublicKey: account.address,
      to,
      gweiAmount,
      hash: '',
      receipt: {},
    };
    console.log(
      `Sending Transaction with Account ${account.address} to ${to} for ${gweiAmount} gwei`
    );
    try {
      const hash = await walletClient.sendTransaction({
        account,
        to,
        value: parseGwei(`${gweiAmount}`),
      });
      console.log(`Transaction Hash: ${hash}`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Transaction Status: ${receipt.status}`);
      result.hash = hash;
      result.receipt = receipt;
    } catch (e) {
      return Response.json({ error: e });
    }
    const { json: jsonResult, meta } = superjson.serialize(result);

    return Response.json({ jsonResult });
  }
}
