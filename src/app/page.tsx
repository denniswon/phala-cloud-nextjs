// src/app/page.tsx
"use client";

import Image from "next/image";
import styles from "./page.module.css";
import React, { useCallback, useMemo, useState } from 'react';
import FormData from 'form-data';

function hexToUint8Array(hex: string) {
  hex = hex.trim();
  if (!hex) {
    throw new Error("Invalid hex string");
  }
  if (hex.startsWith("0x")) {
    hex = hex.substring(2);
  }
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }

  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    if (isNaN(byte)) {
      throw new Error("Invalid hex string");
    }
    array[i / 2] = byte;
  }
  return array;
}

async function uploadUint8Array(data: Uint8Array) {
  const blob = new Blob([data], { type: "application/octet-stream" });
  console.log(blob);
  const file = new File([blob], "quote.bin", {
    type: "application/octet-stream",
  });
  console.log(file);
  const formData = new FormData();
  formData.append("file", file);

  const result = await fetch("https://proof.t16z.com/api/upload", {
    method: "POST",
    // @ts-ignore
    body: formData,
    mode: 'no-cors',
  });
  console.log(result);
  return result;
}

export default function Home() {
  const [result, setResult] = useState<string | null>(null);

  const [ethSeed, setEthSeed] = useState('');
  const [solSeed, setSolSeed] = useState('');
  const [_useSol, setUseSol] = useState(false);
  const useSol = useMemo(() => {
    return _useSol || solSeed !== '';
  }, [solSeed, _useSol]);

  // Define the function to be called on button click
  const handleClick = useCallback(async (path: string) => {
    try {
      let response, data;
      if (path === '/api/account/ethereum') {
        setUseSol(false);
        const addressData = { key: ethSeed };
        response = await fetch(path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(addressData),
        });
        data = await response.json();
        console.log(JSON.stringify(data));
        setResult(JSON.stringify(data, null, 2)); // Pretty print JSON
      } else if (path === '/api/account/solana') {
        setUseSol(true);
        const addressData = { key: solSeed };
        response = await fetch(path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(addressData),
        });
        data = await response.json();
        console.log(JSON.stringify(data));
        setResult(JSON.stringify(data, null, 2)); // Pretty print JSON
      } else if (path === '/api/signMessage') {
        const messageData = { message: "t/acc", key: ethSeed || solSeed, useSol };
        console.log('Signing message...', messageData);
        response = await fetch(path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });
        data = await response.json();
        console.log(JSON.stringify(data));
        setResult(JSON.stringify(data, null, 2)); // Pretty print JSON
      } else {
        console.log(path, { key: ethSeed || solSeed, useSol });
        response = await fetch(path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key: ethSeed || solSeed, useSol }),
        });
        data = await response.json();
        console.log(JSON.stringify(data));
        if (path === '/api/tdx_quote_raw') {
          console.log('Uploading Attestation...');
          const remoteAttestionQuoteHex = data.quote;
          console.log(remoteAttestionQuoteHex);
          const remoteAttestationQuoteU8Array = hexToUint8Array(remoteAttestionQuoteHex);
          console.log(remoteAttestationQuoteU8Array);
          console.log('Uploading Attestation...');
          const uploadResult = await uploadUint8Array(remoteAttestationQuoteU8Array);
          console.log(uploadResult);
          console.log('Upload Complete...');
        }
        setResult(JSON.stringify(data, null, 2)); // Pretty print JSON
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('Error: ' + error);
    }
  }, [ethSeed, solSeed]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.ctas} style={{ display: 'flex', flexDirection: 'column' }}>
        <a className={styles.primary} target="_blank"
             rel="noopener noreferrer" onClick={() => handleClick('/api/tdx_quote_raw')}>
            Remote Attestation
          </a>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" style={{ width: '50%', padding: '8px', borderRadius: '16px', border: '1px solid #ccc' }}
              placeholder="seed key for account" value={ethSeed} onChange={(e) => { setEthSeed(e.target.value); setSolSeed('') }} />
            <a className={styles.primary} target="_blank" style={{ flex: 1 }}
               rel="noopener noreferrer" onClick={() => handleClick(`/api/account/ethereum`)}>
              TEE Account (Ethereum)
            </a>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" style={{ width: '50%', padding: '8px', borderRadius: '16px', border: '1px solid #ccc' }}
              placeholder="seed key for account" value={solSeed} onChange={(e) => { setSolSeed(e.target.value); setEthSeed('') }} />
            <a className={styles.primary} target="_blank" style={{ flex: 1 }}
               rel="noopener noreferrer" onClick={() => handleClick(`/api/account/solana`) }>
              TEE Account (Solana)
            </a>
          </div>
          <a className={styles.primary} target="_blank"
             rel="noopener noreferrer" onClick={() => handleClick('/api/info')}>
            TEE Info
          </a>
        </div>

        <div className={styles.ctas}>
          <a className={styles.secondary} target="_blank"
             rel="noopener noreferrer" onClick={() => handleClick('/api/signMessage')}>
            Sign Message
          </a>
          <a className={styles.secondary} target="_blank"
             rel="noopener noreferrer" onClick={() => handleClick('/api/signTypedData')}>
            Sign Typed Data
          </a>
          <a className={styles.secondary} target="_blank"
             rel="noopener noreferrer" onClick={() => handleClick('/api/signTransaction')}>
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
