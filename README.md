# Phala Cloud Next.js Demo

A [Next.js](https://nextjs.org/)-based demo targeting deployment on [Phala Cloud](https://cloud.phala.network/) and [DStack](https://github.com/dstack-TEE/dstack/).

## Requirements
- [Node](https://nodejs.org/en) >= v18.18
- [yarn](https://yarnpkg.com/)
- Docker or Orbstack

## Development

First, you need to clone this repo:

```shell
git clone --depth 1 https://github.com/denniswon/phala-cloud-nextjs.git
```

Next, let's initialize the development environment:

```shell
yarn
cp env.local.example .env.local
```

We also need to download the DStack simulator:

```shell
# Mac
wget https://github.com/Leechael/tappd-simulator/releases/download/v0.1.4/tappd-simulator-0.1.4-aarch64-apple-darwin.tgz
tar -xvf tappd-simulator-0.1.4-aarch64-apple-darwin.tgz
cd tappd-simulator-0.1.4-aarch64-apple-darwin
./tappd-simulator -l unix:/tmp/tappd.sock

# Linux
wget https://github.com/Leechael/tappd-simulator/releases/download/v0.1.4/tappd-simulator-0.1.4-x86_64-linux-musl.tgz
tar -xvf tappd-simulator-0.1.4-x86_64-linux-musl.tgz
cd tappd-simulator-0.1.4-x86_64-linux-musl
./tappd-simulator -l unix:/tmp/tappd.sock
```

Once the simulator is running, you need to open another terminal to start your Next.js development server:

```shell
yarn dev
```

By default, the Next.js development server will listen on port 3000. Open http://127.0.0.1:3000/ in your browser and check.

This repo also includes code snippets for the following common use cases:

- `/api/tdx_quote`: The `reportdata` is `test` and generates the quote for attestation report via `tdxQuote` API.
- `/api/tdx_quote_raw`: The `reportdata` is `Hello DStack!` and generates the quote for attestation report. The difference from `/api/dx_quote` is that you can see the raw text `Hello DStack!` in [Attestation Explorer](https://proof.t16z.com/).
- `/api/eth_account/address`: Using the `deriveKey` API to generate a deterministic wallet for Ethereum, a.k.a. a wallet held by the TEE instance.
- `/api/solana_account/address`: Using the `deriveKey` API to generate a deterministic wallet for Solana, a.k.a. a wallet held by the TEE instance.
- `/api/info`: Returns the TCB Info of the hosted CVM.

## Build

You need to build the image and push it to DockerHub for deployment. The following instructions are for publishing to a public registry via DockerHub:

```shell
sudo docker build . -t jhwon0820/phala-cloud-nextjs
sudo docker push jhwon0820/phala-cloud-nextjs
```

## Deploy

You can copy and paste the `docker-compose.yml` file from this repo to see the example up and running.