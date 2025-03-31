import {TappdClient} from '@phala/dstack-sdk'
import 'dotenv/config'
import { privateKeyToAccount } from 'viem/accounts'
import {
  keccak256,
  http,
  type Address,
  createPublicClient,
  PrivateKeyAccount,
  verifyMessage,
  createWalletClient,
  parseGwei
} from 'viem'
import {sepolia} from "viem/chains";

const endpoint = process.env.DSTACK_SIMULATOR_ENDPOINT || 'http://localhost:8090'

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})
const walletClient = createWalletClient({
  chain: sepolia,
  transport: http(),
})

export const dynamic = 'force-dynamic'

export async function GET() {
  console.log(endpoint)
  const client = new TappdClient(endpoint)
  const testDeriveKey = await client.deriveKey("/", "test");
  const keccakPrivateKey = keccak256(testDeriveKey.asUint8Array());
  const account = privateKeyToAccount(keccakPrivateKey);
  const to = '0xC5227Cb20493b97bb02fADb20360fe28F52E2eff';
  const gweiAmount = 420;
  let result = {
    derivedPublicKey: account.address,
    to,
    gweiAmount,
    hash: '',
    receipt: {}
  }
  console.log(`Sending Transaction with Account ${account.address} to ${to} for ${gweiAmount} gwei`)
  try {
    // @ts-ignore
    const hash = await walletClient.sendTransaction({
      account,
      to,
      value: parseGwei(`${gweiAmount}`),
    })
    console.log(`Transaction Hash: ${hash}`)
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log(`Transaction Status: ${receipt.status}`)
    result.hash = hash
    result.receipt = receipt
  } catch (e) {
    return Response.json({error: e})
  }

  return Response.json({ result });
}
