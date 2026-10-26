"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/Confirm";
import { Input, Label, Textarea } from "@/components/ui/fields";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { createMoment, createMomentUpload, deleteMoment, updateMoment, type Result } from "@/app/admin/actions";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { formatShortDate } from "@/lib/format";
import type { Moment } from "@/lib/queries";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_BYTES = 10 * 1024 * 1024;

const MAX_EDGE = 2400;

/** Perkecil foto (sisi terpanjang 2400px) dan simpan sebagai WebP sebelum diunggah; foto HP 5-10 MB jadi ±300-600 KB. */
async function prepareImage(file: File): Promise<File> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) {
      bmp.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.82));
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" }) : file;
  } catch {
    return file;
  }
}

function imageSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export function MomentManager({ rows, missingTable }: { rows: Moment[]; missingTable: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [creating, setCreating] = useState(false);
  const [del, setDel] = useState<Moment | null>(null);

  const run = (fn: () => Promise<Result>, ok?: string, after?: () => void) =>
    start(async () => {
      const r = await fn();
      if (r.ok) {
        if (ok) toast(ok);
        after?.();
        router.refresh();
      } else toast(r.error, true);
    });

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[22px] font-semibold">Momen angkatan</h1>
        <Button onClick={() => setCreating(true)} disabled={missingTable}>
          <ImagePlus size={18} strokeWidth={1.75} aria-hidden /> Tambah momen
        </Button>
      </div>

      {missingTable ? (
        <p className="mt-4 rounded-lg border border-warn/40 bg-warn/10 p-4 text-warn">
          Tabel <code className="font-mono">moments</code> belum ada. Jalankan <code className="font-mono">supabase/migrations/0002_moments.sql</code> di SQL Editor Supabase.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-4 glass rounded-[22px] p-6 text-ink-2">Belum ada momen. Unggah foto pertama angkatan.</p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((m) => (
            <li key={m.id} className="overflow-hidden glass rounded-[22px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.image_url} alt="" loading="lazy" className={`aspect-[4/3] w-full object-cover ${m.is_visible ? "" : "opacity-40"}`} />
              <div className="p-3">
                <p className="truncate font-semibold">{m.title}</p>
                <p className="font-mono text-[12px] text-muted">{formatShortDate(m.taken_on)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="flex items-center gap-1 text-[13px]">
                    Tampil
                    <Switch label="Tampil" checked={m.is_visible} disabled={pending} onChange={(v) => run(() => updateMoment(m.id, { is_visible: v }))} />
                  </label>
                  <Button variant="ghost" className="ml-auto" aria-label={`Hapus ${m.title}`} onClick={() => setDel(m)}>
                    <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CreateMoment
        open={creating}
        onOpenChange={setCreating}
        onDone={() => {
          setCreating(false);
          router.refresh();
        }}
      />
      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title="Hapus momen?"
        description={del ? `"${del.title}" dan fotonya akan dihapus permanen.` : ""}
        busy={pending}
        onConfirm={() => del && run(() => deleteMoment(del.id), "Momen dihapus", () => setDel(null))}
      />
    </>
  );
}

function CreateMoment({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void }) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setTitle("");
    setCaption("");
    setError(null);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("Pilih foto terlebih dahulu");
    if (file.size > MAX_BYTES) return setError("Ukuran foto maksimal 10 MB");
    setBusy(true);
    setError(null);
    try {
      const file2 = await prepareImage(file);
      const up = await createMomentUpload(file2.type);
      if (!up.ok || !up.path || !up.token) throw new Error(up.ok ? "Gagal menyiapkan unggahan" : up.error);
      const { error: upErr } = await supabaseBrowser().storage.from("moments").uploadToSignedUrl(up.path, up.token, file2, { contentType: file2.type });
      if (upErr) throw new Error("Unggah foto gagal");
      const size = await imageSize(file2);
      const r = await createMoment({ title, caption: caption || null, taken_on: date, image_path: up.path, width: size?.width, height: size?.height });
      if (!r.ok) throw new Error(r.error);
      toast("Momen ditambahkan");
      reset();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }} title="Tambah momen">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="grid aspect-[4/3] w-full cursor-pointer place-items-center overflow-hidden rounded-[14px] neu-well border border-dashed border-line-strong text-muted hover:border-brand-400"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Pratinjau" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-[14px]">
              <ImagePlus size={24} strokeWidth={1.5} aria-hidden /> Pilih foto (JPG/PNG/WebP, maks 10 MB)
            </span>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            if (preview) URL.revokeObjectURL(preview);
            setFile(f);
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
        />
        <div>
          <Label htmlFor="m-title">Judul</Label>
          <Input id="m-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
        </div>
        <div>
          <Label htmlFor="m-date">Tanggal</Label>
          <Input id="m-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="m-cap">Keterangan (opsional)</Label>
          <Textarea id="m-cap" rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={600} />
        </div>
        {error ? <p className="text-[13px] text-danger" role="alert">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button type="submit" disabled={busy}>{busy ? "Mengunggah…" : "Simpan"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
