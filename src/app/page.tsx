// src/app/page.tsx
'use client';

import FormData from 'form-data';
import { useCallback, useState } from 'react';
import styles from './page.module.css';

function hexToUint8Array(hex: string) {
  hex = hex.trim();
  if (!hex) {
    throw new Error('Invalid hex string');
  }
  if (hex.startsWith('0x')) {
    hex = hex.substring(2);
  }
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }

  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    if (isNaN(byte)) {
      throw new Error('Invalid hex string');
    }
    array[i / 2] = byte;
  }
  return array;
}

async function uploadUint8Array(data: Uint8Array) {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  console.log(blob);
  const file = new File([blob], 'quote.bin', {
    type: 'application/octet-stream',
  });
  console.log(file);
  const formData = new FormData();
  formData.append('file', file);

  const result = await fetch('https://proof.t16z.com/api/upload', {
    method: 'POST',
    // @ts-ignore
    body: formData,
    mode: 'no-cors',
  });
  console.log(result);
  return result;
}

export default function Home() {
  const [result, setResult] = useState<string | null>(null);

  const [chain, setChain] = useState<'ethereum' | 'solana'>('ethereum');
  const [seed, setSeed] = useState('');

  // Define the function to be called on button click
  const handleClick = useCallback(
    async (path: string) => {
      try {
        let response, data;
        const postData: { [key: string]: string } = { key: seed, chain };

        if (path === '/api/signMessage') {
          postData.message = 't/acc';
          console.log('Signing message...', postData);
        }

        response = await fetch(path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        });

        data = await response.json();
        console.log(JSON.stringify(data));

        if (path === '/api/tdx_quote_raw') {
          console.log('Uploading Attestation...');
          const remoteAttestionQuoteHex = data.quote;
          console.log(remoteAttestionQuoteHex);
          const remoteAttestationQuoteU8Array = hexToUint8Array(
            remoteAttestionQuoteHex
          );
          console.log(remoteAttestationQuoteU8Array);
          console.log('Uploading Attestation...');
          const uploadResult = await uploadUint8Array(
            remoteAttestationQuoteU8Array
          );
          console.log(uploadResult);
          console.log('Upload Complete...');
        }

        setResult(JSON.stringify(data, null, 2)); // Pretty print JSON
      } catch (error) {
        console.error('Error:', error);
        setResult('Error: ' + error);
      }
    },
    [chain, seed]
  );

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div
          className={styles.ctas}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <div
            style={{
              gap: '24px',
              display: 'flex',
              flexDirection: 'row',
              padding: '8px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div>
              <input
                checked={chain === 'ethereum'}
                onChange={() => setChain('ethereum')}
                id="default-radio-1"
                type="radio"
                value="ethereum"
                name="default-radio"
                style={{ marginRight: '4px' }}
              />
              <label
                htmlFor="default-radio-1"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Ethereum
              </label>
            </div>
            <div>
              <input
                checked={chain === 'solana'}
                onChange={() => setChain('solana')}
                id="default-radio-2"
                type="radio"
                value="solana"
                name="default-radio"
                style={{ marginRight: '4px' }}
              />
              <label
                htmlFor="default-radio-2"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Solana
              </label>
            </div>
          </div>

          <a
            className={styles.primary}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick('/api/info')}
          >
            TEE Info
          </a>
          <a
            className={styles.primary}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick('/api/tdx_quote_raw')}
          >
            Remote Attestation
          </a>
          <div style={{ display: 'flex', gap: '16px' }}>
            <input
              type="text"
              style={{
                width: '50%',
                padding: '0 16px',
                borderRadius: '24px',
                border: '1px solid #ccc',
                textAlign: 'center',
              }}
              placeholder="Enter seed for account"
              value={seed}
              onChange={(e) => {
                setSeed(e.target.value);
              }}
            />
            <a
              className={styles.primary}
              target="_blank"
              style={{ flex: 1 }}
              rel="noopener noreferrer"
              onClick={() => handleClick(`/api/account/${chain}`)}
            >
              TEE Account
            </a>
          </div>
        </div>

        <div className={styles.ctas}>
          <a
            className={styles.secondary}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick('/api/signMessage')}
          >
            Sign Message
          </a>
          <a
            style={{
              opacity: chain === 'solana' ? 0.5 : 1,
              cursor: chain === 'solana' ? 'not-allowed' : 'pointer',
              pointerEvents: chain === 'solana' ? 'none' : 'auto',
            }}
            className={styles.secondary}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick('/api/signTypedData')}
          >
            Sign Typed Data
          </a>
          <a
            className={styles.secondary}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick('/api/signTransaction')}
          >
            Sign Transaction
          </a>
        </div>
        <div className={styles.resultBox}>
          <h3>Result:</h3>
          <pre>{result}</pre>
        </div>
      </main>
    </div>
  );
}
