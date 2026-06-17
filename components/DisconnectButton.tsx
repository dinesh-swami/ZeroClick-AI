'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/disconnet.css';

export function DisconnectButton({ integration, label }: { integration: string; label: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/auth/connect/${integration}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        console.error('Failed to disconnect');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDisconnect} disabled={loading} className="disconnect-btn">
      <span className="disconnect-btn__smoke" />
      <span className="disconnect-btn__ember" />
      <span className="disconnect-btn__ember" />
      <span className="disconnect-btn__ember" />

      <span className="disconnect-btn__text">{loading ? 'Disconnecting...' : ` ${label}`}</span>
    </button>
  );
}
