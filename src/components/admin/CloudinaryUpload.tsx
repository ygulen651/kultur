'use client';
import * as React from 'react';

type Props = {
  onUploaded: (payload: { url: string; publicId: string }) => void;
  accept?: string;
};

export default function CloudinaryUpload({ onUploaded, accept = 'image/*' }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);

  async function handleFile(f: File) {
    setBusy(true);
    try {
      // 1) signature al
      const sigRes = await fetch('/api/cloudinary/sign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const { timestamp, folder, signature, apiKey, cloudName } = await sigRes.json();

      // 2) Cloudinary’e POST (client → Cloudinary)
      const form = new FormData();
      form.append('file', f);
      form.append('api_key', apiKey);
      form.append('timestamp', String(timestamp));
      form.append('signature', signature);
      form.append('folder', folder);

      const uploadURL = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      const up = await fetch(uploadURL, { method: 'POST', body: form });
      const data = await up.json();

      if (!up.ok || !data.secure_url) throw new Error(data.error?.message || 'Upload failed');

      onUploaded({ url: data.secure_url, publicId: data.public_id });
    } catch (e: any) {
      alert(e?.message || String(e));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {busy && <span className="text-sm text-muted-foreground">Yükleniyor…</span>}
    </div>
  );
}
