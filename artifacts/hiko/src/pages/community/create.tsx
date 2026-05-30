import { useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { checkBlacklist } from '@/lib/moderation';
import { useImageUpload } from '@/hooks/useImageUpload';
import type { Community } from '@/types/index';
import { ArrowLeft, ArrowRight, Check, Globe, UserCheck, Lock, Loader2, AlertTriangle, Info, ImagePlus } from 'lucide-react';


type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  nome: string;
  descrizione: string;
  citta: string;
  livello_runner: Community['livello_runner'];
  tipo: Community['tipo'];
  immagine_url: string;
}

export default function CreateCommunity() {
  const [, setLocation] = useLocation();
  const user = useAuthStore(s => s.user);
  const openAuthModal = useAuthStore(s => s.openAuthModal);
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>({
    nome: '',
    descrizione: '',
    citta: '',
    livello_runner: null,
    tipo: 'aperta',
    immagine_url: '',
  });
  const [error, setError] = useState('');

  const coverUpload = useImageUpload('community-covers');

  const nomeViolation = form.nome ? checkBlacklist(form.nome) : null;
  const descViolation = form.descrizione ? checkBlacklist(form.descrizione) : null;
  // Solo i "blocked" impediscono di procedere; i "flagged" mostrano un warning giallo ma lasciano passare
  const hasHardBlock = !!(
    (nomeViolation?.decision === 'blocked') ||
    (descViolation?.decision === 'blocked')
  );

  const set = (k: keyof FormData, v: string | null) => setForm(f => ({ ...f, [k]: v }));

  const canAdvance = () => {
    if (step === 1) return form.nome.trim().length >= 3 && !hasHardBlock;
    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      openAuthModal('Accedi per creare una community', handleSubmit);
      return;
    }
    const violation = checkBlacklist(form.nome) ?? checkBlacklist(form.descrizione);
    if (violation?.decision === 'blocked') { setError(violation.reason); return; }
    setSaving(true);
    setError('');
    try {
      const { data, error: err } = await supabase.from('communities').insert({
        nome: form.nome.trim(),
        descrizione: form.descrizione.trim() || null,
        tipo: form.tipo,
        fondatore_id: user.id,
        citta: form.citta.trim() || null,
        livello_runner: form.livello_runner || null,
        immagine_url: form.immagine_url || null,
      }).select('id').single();

      if (err) { setError(err.message); setSaving(false); return; }
      setLocation(`/community/${data.id}`);
    } catch (e) {
      setError('Errore di connessione. Verifica la tua rete e riprova.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-hiko-deep text-white">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <button onClick={() => step > 1 ? setStep(s => (s - 1) as Step) : setLocation('/community')} className="text-white/60 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <p className="text-white font-bold">Crea community</p>
          <p className="text-white/40 text-xs">Step {step} di 5</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 px-4 pt-4">
        {([1, 2, 3, 4, 5] as Step[]).map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-hiko-primary' : 'bg-white/10'}`} />
        ))}
      </div>

      <div className="px-4 py-8">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-6">Come si chiama la tua community?</h2>
            <input
              value={form.nome}
              onChange={e => set('nome', e.target.value)}
              maxLength={50}
              placeholder="Nome community..."
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none text-lg mb-1 transition-colors ${
                nomeViolation?.decision === 'blocked' ? 'border-red-500/60' :
                nomeViolation?.decision === 'flagged' ? 'border-yellow-500/60' :
                'border-white/10 focus:border-hiko-primary/50'
              }`}
            />
            {nomeViolation?.decision === 'blocked' ? (
              <div className="flex items-center gap-1.5 mb-3">
                <AlertTriangle size={12} className="text-red-400 shrink-0" />
                <p className="text-xs text-red-400">{nomeViolation.reason}</p>
              </div>
            ) : nomeViolation?.decision === 'flagged' ? (
              <div className="flex items-center gap-1.5 mb-3">
                <Info size={12} className="text-yellow-400 shrink-0" />
                <p className="text-xs text-yellow-300">{nomeViolation.reason} Il nome sarà revisionato.</p>
              </div>
            ) : (
              <p className="text-white/30 text-xs mb-4">{form.nome.length}/50</p>
            )}
            <textarea
              value={form.descrizione}
              onChange={e => set('descrizione', e.target.value)}
              maxLength={300}
              placeholder="Descrizione (opzionale)..."
              rows={4}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none resize-none transition-colors ${
                descViolation?.decision === 'blocked' ? 'border-red-500/60' :
                descViolation?.decision === 'flagged' ? 'border-yellow-500/60' :
                'border-white/10 focus:border-hiko-primary/50'
              }`}
            />
            {descViolation?.decision === 'blocked' ? (
              <div className="flex items-center gap-1.5 mt-1">
                <AlertTriangle size={12} className="text-red-400 shrink-0" />
                <p className="text-xs text-red-400">{descViolation.reason}</p>
              </div>
            ) : descViolation?.decision === 'flagged' ? (
              <div className="flex items-center gap-1.5 mt-1">
                <Info size={12} className="text-yellow-400 shrink-0" />
                <p className="text-xs text-yellow-300">{descViolation.reason} Sarà revisionata.</p>
              </div>
            ) : (
              <p className="text-white/30 text-xs mt-1">{form.descrizione.length}/300</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-6">Immagine di copertina</h2>
            <input
              ref={coverUpload.inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !user) return;
                const url = await coverUpload.handleFile(file, user.id);
                if (url) set('immagine_url', url);
              }}
            />
            {form.immagine_url ? (
              <div className="relative">
                <img src={form.immagine_url} alt="" className="w-full h-48 object-cover rounded-xl" />
                <button
                  onClick={coverUpload.open}
                  className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-black/80"
                >
                  <ImagePlus size={14} /> Cambia
                </button>
              </div>
            ) : (
              <button
                onClick={coverUpload.open}
                disabled={coverUpload.uploading}
                className="w-full h-48 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 text-white/40 hover:border-hiko-primary/40 hover:text-white/60 transition-colors"
              >
                {coverUpload.uploading
                  ? <Loader2 size={28} className="animate-spin" />
                  : <><ImagePlus size={28} /><span className="text-sm">Scegli dal dispositivo</span></>
                }
              </button>
            )}
            <p className="text-white/30 text-xs mt-2 text-center">Oppure incolla un URL</p>
            <input
              value={form.immagine_url}
              onChange={e => { set('immagine_url', e.target.value); coverUpload.setPreview(e.target.value); }}
              placeholder="https://..."
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-hiko-primary/50 text-sm"
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-6">Dove corri?</h2>
            <input
              value={form.citta}
              onChange={e => set('citta', e.target.value)}
              placeholder="Città o territorio (opzionale)..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-hiko-primary/50 mb-4"
            />
            <p className="text-white/50 text-sm mb-3">Livello dei runner</p>
            <div className="flex flex-col gap-2">
              {([null, 'principiante', 'intermedio', 'avanzato'] as const).map(l => (
                <button
                  key={l ?? 'tutti'}
                  onClick={() => set('livello_runner', l)}
                  className={`text-left px-4 py-3 rounded-xl border transition-colors capitalize ${form.livello_runner === l ? 'border-hiko-primary bg-hiko-primary/10 text-hiko-primary' : 'border-white/10 text-white/60 hover:border-white/30'}`}
                >
                  {l ?? 'Tutti i livelli'}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-6">Tipo di accesso</h2>
            <div className="flex flex-col gap-3">
              {([
                { tipo: 'aperta', icon: Globe, label: 'Aperta', desc: 'Chiunque può unirsi liberamente.' },
                { tipo: 'approvazione', icon: UserCheck, label: 'Su approvazione', desc: 'Devi approvare ogni nuovo membro.' },
                { tipo: 'privata', icon: Lock, label: 'Privata', desc: 'Solo su invito diretto.' },
              ] as { tipo: Community['tipo']; icon: typeof Globe; label: string; desc: string }[]).map(({ tipo, icon: Icon, label, desc }) => (
                <button
                  key={tipo}
                  onClick={() => set('tipo', tipo)}
                  className={`text-left px-4 py-4 rounded-xl border transition-colors ${form.tipo === tipo ? 'border-hiko-primary bg-hiko-primary/10' : 'border-white/10 hover:border-white/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={form.tipo === tipo ? 'text-hiko-primary' : 'text-white/50'} />
                    <div>
                      <p className={`font-bold ${form.tipo === tipo ? 'text-hiko-primary' : 'text-white'}`}>{label}</p>
                      <p className="text-white/50 text-xs">{desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-xl font-bold mb-6">Conferma e crea</h2>
            <div className="glass-panel rounded-2xl p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-white/50">Nome</span><span className="text-white font-medium">{form.nome}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Tipo</span><span className="text-white capitalize">{form.tipo}</span></div>
              {form.citta && <div className="flex justify-between"><span className="text-white/50">Città</span><span className="text-white">{form.citta}</span></div>}
              {form.livello_runner && <div className="flex justify-between"><span className="text-white/50">Livello</span><span className="text-white capitalize">{form.livello_runner}</span></div>}
            </div>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </div>
        )}

        <div className="mt-8">
          {step < 5 ? (
            <button
              onClick={() => setStep(s => (s + 1) as Step)}
              disabled={!canAdvance()}
              className="w-full bg-hiko-primary text-hiko-deep font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40"
            >
              Avanti <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-hiko-primary text-hiko-deep font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              Crea community
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
