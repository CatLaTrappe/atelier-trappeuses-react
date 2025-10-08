import React, { useEffect, useMemo, useState } from "react";

// 🪶 Atelier de textes – MVP 1.4
// Ajoute un **WelcomeFlow** guidé : au chargement, l’app propose les types de textes
// puis enchaîne automatiquement les questions une à une, avec actions [Modifier] [Suivant] [Recommencer].

const ls = {
  get: (k, fallback) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

const classJoin = (...c) => c.filter(Boolean).join(" ");

// ------------------ TEMPLATES (extraits essentiels) ------------------
const TEMPLATES = [
  {
    id: 'mag_trappeuses_intro',
    name: '📰 Magazine – Intro Trappeuses du Québec',
    audience: 'Grand public + trappeuses/curieuses',
    tone: 'Chaleureux, informatif, inclusif, missionnel',
    sections: [
      { title: 'Contexte & Mission', questions: [
        { id: 'qui', label: 'Qui parle ? (TUQ/Cat, rôle)' },
        { id: 'mission', label: 'Mission en une phrase forte' },
        { id: 'valeurs', label: 'Valeurs clés' },
      ]},
      { title: 'Pourquoi maintenant ?', questions: [
        { id: 'pourquoi', label: 'Contexte / enjeu actuel' },
        { id: 'public', label: 'Public visé' },
      ]},
      { title: 'Preuves & communauté', questions: [
        { id: 'preuves', label: 'Exemples concrets / réalisations' },
        { id: 'temoins', label: 'Témoignage / anecdote (facultatif)' },
      ]},
      { title: 'Appel à l’action', questions: [
        { id: 'cta', label: 'Appel à l’action (CTA)' },
        { id: 'liens', label: 'Liens / repères (facultatif)' },
      ]}
    ],
    md: (a) => `# Trappeuses du Québec — Présentation\n\n**Par :** ${a.qui || ''}\n\n## Notre mission\n${a.mission || ''}\n\n**Valeurs :** ${a.valeurs || ''}\n\n## Pourquoi maintenant ?\n**Contexte :** ${a.pourquoi || ''}\n\n**Public visé :** ${a.public || ''}\n\n## La force de la communauté\n${a.preuves || ''}\n\n${a.temoins ? `> Témoignage / anecdote\n> ${a.temoins}` : ''}\n\n## Et maintenant ?\n${a.cta || ''}\n\n${a.liens ? `---\n**Pour aller plus loin :**\n${a.liens}` : ''}`
  },
  {
    id: 'blog_seo_classique',
    name: '📝 Blog – Article SEO classique',
    audience: 'Curieuses, grand public, communauté',
    tone: 'Pédagogique, accessible, chaleureux',
    sections: [
      { title: 'Cadrage', questions: [
        { id: 'titre', label: 'Titre (H1)' },
        { id: 'angle', label: 'Angle / promesse' },
        { id: 'personas', label: 'Public / persona' },
        { id: 'mots', label: 'Mots-clés principaux' },
      ]},
      { title: 'Plan rapide', questions: [
        { id: 'plan', type: 'textarea', label: 'Plan en 4–6 points' },
      ]},
      { title: 'Preuves & exemples', questions: [
        { id: 'exemples', type: 'textarea', label: 'Exemples / données / sources' },
      ]},
      { title: 'CTA & méta', questions: [
        { id: 'cta', label: 'Appel à l’action (CTA)' },
        { id: 'chapo', type: 'textarea', label: 'Chapeau (2–3 phrases)' },
        { id: 'desc', type: 'textarea', label: 'Méta description (≤ 160 car.)' },
      ]}
    ],
    md: (a) => `---\nTitle: ${a.titre || 'Titre à définir'}\nDescription: ${a.desc || ''}\nKeywords: ${a.mots || ''}\n---\n\n${a.chapo ? `> ${a.chapo}\n\n` : ''}# ${a.titre || 'Titre à définir'}\n\n*Public visé :* ${a.personas || ''}\n\n**Angle / promesse :** ${a.angle || ''}\n\n## Plan\n${a.plan || '(À détailler)'}\n\n## Exemples, preuves et références\n${a.exemples || ''}\n\n---\n${a.cta || ''}`
  },
  {
    id: 'grande_trappe_podcast_teaser',
    name: '🎙️ La Grande Trappe – Teaser d’épisode',
    audience: 'Abonnées podcast + YouTube',
    tone: 'Punché, franc, drôle au besoin',
    sections: [
      { title: 'Infos de base', questions: [
        { id: 'num', label: 'Numéro d’épisode' },
        { id: 'titre', label: 'Titre d’épisode' },
        { id: 'inv', label: 'Invité(e)' },
      ]},
      { title: 'Promesse', questions: [
        { id: 'accroche', type: 'textarea', label: 'Accroche percutante (1–2 phrases)' },
        { id: 'points', type: 'textarea', label: '3–5 sujets clés (puces)' },
      ]},
      { title: 'Liens', questions: [
        { id: 'liens', type: 'textarea', label: 'Plateformes / mentions' },
      ]}
    ],
    md: (a) => `🎙️ *La Grande Trappe* — Teaser\n\n**Épisode ${a.num || '?'} — ${a.titre || 'Titre à venir'}**${a.inv ? ` — avec ${a.inv}` : ''}\n\n${a.accroche || ''}\n\n${a.points || ''}\n\n${a.liens ? `🔗 ${a.liens}` : ''}`
  },
  {
    id: 'video_script',
    name: '🎬 Script vidéo / vlog',
    audience: 'Abonnées YouTube + communauté TUQ',
    tone: 'Authentique, dynamique, pédagogique',
    sections: [
      { title: 'Infos de base', questions: [
        { id: 'titre', label: 'Titre provisoire' },
        { id: 'objectif', label: 'Objectif' },
        { id: 'duree', label: 'Durée visée' },
      ]},
      { title: 'Hook & Intro', questions: [
        { id: 'hook', type: 'textarea', label: 'Hook (10–15 s)' },
        { id: 'intro', type: 'textarea', label: 'Intro (qui/quoi/pourquoi)' },
      ]},
      { title: 'Plan par segments', questions: [
        { id: 'segments', type: 'textarea', label: 'Segments (beats)' },
      ]},
      { title: 'B-roll & tournage', questions: [
        { id: 'broll', type: 'textarea', label: 'Liste B‑roll' },
        { id: 'son', label: 'Ambiances/son' },
        { id: 'callouts', type: 'textarea', label: 'Callouts/overlays' },
      ]},
      { title: 'CTA & méta', questions: [
        { id: 'cta', label: 'CTA fin' },
        { id: 'desc', type: 'textarea', label: 'Description YouTube' },
        { id: 'tags', label: 'Tags (virgules)' },
      ]}
    ],
    md: (a) => `# Script vidéo / vlog\n\n**Titre provisoire :** ${a.titre || ''}  \n**Objectif :** ${a.objectif || ''}  \n**Durée visée :** ${a.duree || ''}\n\n## Hook (10–15s)\n${a.hook || ''}\n\n## Intro\n${a.intro || ''}\n\n## Segments (beats)\n${a.segments || ''}\n\n## B‑roll / tournage\n**B‑roll :** \n${a.broll || ''}\n\n**Ambiances/son :** ${a.son || ''}  \n**Callouts/overlays :** \n${a.callouts || ''}\n\n---\n**CTA :** ${a.cta || ''}\n\n### Description YouTube\n${a.desc || ''}\n\n**Tags :** ${a.tags || ''}`
  },
  {
    id: 'grande_trappe_brief',
    name: '🧠 Brief d’épisode – La Grande Trappe',
    audience: 'Abonnées podcast + YouTube',
    tone: 'Amical, punché, franc',
    sections: [
      { title: 'Infos de base', questions: [
        { id: 'num', label: 'Numéro d’épisode' },
        { id: 'titre', label: 'Titre d’épisode' },
        { id: 'invite', label: 'Invité(e) et rôle' },
      ]},
      { title: 'Présentation & Accueil', questions: [
        { id: 'presentation', type: 'textarea', label: 'Présentation (🧠)' },
        { id: 'accueil', type: 'textarea', label: 'Accueil (❤️)' },
      ]},
      { title: 'Questions (blocs)', questions: [
        { id: 'q_blocs', type: 'textarea', label: 'Blocs de questions (❓)' },
      ]},
      { title: 'Segments spéciaux', questions: [
        { id: 'pourquoi_trappe', type: 'textarea', label: '🪤 Pourquoi je trappe (facultatif)' },
        { id: 'citation', label: 'Citation à isoler' },
      ]},
      { title: 'Clôture & Lien', questions: [
        { id: 'cloture', type: 'textarea', label: '🚪 Clôture' },
        { id: 'liens', type: 'textarea', label: 'Liens/ressources' },
      ]},
      { title: 'Description (format Cathy)', questions: [
        { id: 'desc_intro', type: 'textarea', label: 'Introduction narrative' },
        { id: 'desc_corps', type: 'textarea', label: 'Sujets/Questions en puces' },
      ]}
    ],
    md: (a) => `🎙️ *La Grande Trappe* — Brief d’épisode\n\n**Épisode ${a.num || '?'} – ${a.titre || 'Titre à venir'}** — avec ${a.invite || ''}\n\n## 🧠 Présentation\n${a.presentation || ''}\n\n## ❤️ Accueil\n${a.accueil || ''}\n\n## ❓ Questions (blocs)\n${a.q_blocs || ''}\n\n${a.pourquoi_trappe ? `## 🪤 Pourquoi je trappe (extrait)\n${a.pourquoi_trappe}\n` : ''}\n\n## ✂️ Citation à isoler\n${a.citation || ''}\n\n## 🚪 Clôture\n${a.cloture || ''}\n\n${a.liens ? `---\n🔗 Liens et plateformes\n${a.liens}\n` : ''}\n\n---\n✍️ **Description de l’épisode (format Cathy)**  \n🎙️ Épisode ${a.num || '?'} – ${a.titre || 'Titre à venir'} – avec ${a.invite || ''}\n\n${a.desc_intro || ''}\n\n${a.presentation || ''}\n\n${a.desc_corps || ''}\n\n🔗 Retrouvez l’épisode sur Spotify, Apple Podcasts, YouTube et toutes les autres plateformes.`
  },
  {
    id: 'libre_personnalise',
    name: '🧩 Modèle libre – Crée tes propres questions',
    audience: 'À définir',
    tone: 'À définir',
    custom: true,
    sections: [ { title: 'Questions personnalisées', questions: [
      { id: 'custom_0', label: 'Question 1' },
      { id: 'custom_1', label: 'Question 2' },
      { id: 'custom_2', label: 'Question 3' },
    ]} ],
    md: (a) => `# Brouillon\n\n${Object.entries(a).map(([k,v])=>`**${k}**\n${v}\n`).join('\n')}`
  }
];

// ------------------ WELCOME FLOW (guided) ------------------
function WelcomeFlow({ onPick }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-2">Salut Cat! 💛 Qu’est-ce qu’on compose aujourd’hui ?</h2>
      <p className="text-neutral-600 mb-4">Choisis un type de texte ci-dessous. Tu peux changer d’idée à tout moment.</p>
      <div className="grid grid-cols-1 gap-2">
        {['mag_trappeuses_intro','blog_seo_classique','grande_trappe_podcast_teaser','video_script','grande_trappe_brief','libre_personnalise']
          .map(id => TEMPLATES.find(t=>t.id===id))
          .map(t => (
            <button key={t.id} onClick={()=>onPick(t.id)} className="w-full text-left px-4 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-100">
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-neutral-600">{t.audience} — {t.tone}</div>
            </button>
          ))}
      </div>
    </div>
  );
}

function GuidedQuestions({ tpl, answers, setAnswer, onDone, onCancel }) {
  // Aplatis toutes les questions dans l’ordre des sections
  const flatQs = tpl.sections.flatMap(s => (s.questions||[]).map(q => ({...q, section:s.title})));
  const [idx, setIdx] = useState(0);

  const q = flatQs[idx];
  const val = (answers||{})[q?.id] || '';

  const next = () => { if (idx < flatQs.length - 1) setIdx(i=>i+1); else onDone(); };
  const prev = () => { if (idx > 0) setIdx(i=>i-1); };

  return (
    <div className="p-6 space-y-4">
      <div className="text-sm text-neutral-500">{tpl.name} · {idx+1}/{flatQs.length} · <span className="italic">{q?.section}</span></div>
      <div>
        <div className="text-lg font-semibold mb-2">{q?.label || q?.id}</div>
        {q?.type==='textarea' ? (
          <textarea className="w-full border border-neutral-300 rounded-xl p-3 min-h-[140px]" value={val} onChange={e=>setAnswer(q.id, e.target.value)} placeholder={q?.placeholder||''} />
        ) : (
          <input className="w-full border border-neutral-300 rounded-xl p-3" value={val} onChange={e=>setAnswer(q.id, e.target.value)} placeholder={q?.placeholder||''} />
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={prev} disabled={idx===0} className={classJoin("px-3 py-2 rounded-lg border", idx===0 && 'opacity-50 cursor-not-allowed')}>Retour</button>
        <button onClick={next} className="px-3 py-2 rounded-lg border bg-black text-white">{idx===flatQs.length-1? 'Générer' : 'Suivant'}</button>
        <button onClick={onCancel} className="px-3 py-2 rounded-lg border">Changer de mode</button>
      </div>
      <div className="text-sm text-neutral-600">Actions : [Modifier = change la réponse], [Suivant], [Changer de mode], [Générer].</div>
    </div>
  );
}

// ------------------ UI Helpers ------------------
function SectionCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-5">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type }) {
  const isBig = type === "textarea";
  return (
    <label className="block">
      <div className="text-sm font-medium mb-1">{label}</div>
      {isBig ? (
        <textarea className="w-full border border-neutral-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black/30 min-h-[120px]" value={value || ""} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder || ""} />
      ) : (
        <input className="w-full border border-neutral-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black/30" value={value || ""} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder || ""} />
      )}
    </label>
  );
}

// ------------------ MAIN ------------------
export default function AtelierTextes() {
  const [activeId, setActiveId] = useState(ls.get("atelier.activeId", "mag_trappeuses_intro"));
  const [answers, setAnswers] = useState(ls.get("atelier.answers", {}));
  const [output, setOutput] = useState("");
  const [guidedMode, setGuidedMode] = useState(true); // ⬅️ démarre en mode guidé

  const tpl = useMemo(()=> TEMPLATES.find(t => t.id === activeId) || TEMPLATES[0], [activeId]);
  const a = answers[activeId] || {};

  useEffect(()=>{ ls.set("atelier.activeId", activeId); }, [activeId]);
  useEffect(()=>{ ls.set("atelier.answers", answers); }, [answers]);

  const setA = (qid, v) => setAnswers(prev => ({ ...prev, [activeId]: { ...(prev[activeId]||{}), [qid]: v } }));

  const makeMarkdown = () => {
    const md = (tpl.md || ((x)=>JSON.stringify(x,null,2)))(a);
    setOutput(md);
    try { navigator.clipboard.writeText(md); } catch {}
  };

  // ---------------- Guided overlay ----------------
  if (guidedMode) {
    return (
      <div className="min-h-screen w-full bg-neutral-50 text-neutral-900">
        <div className="max-w-4xl mx-auto p-6">
          {!tpl || !a || Object.keys(a).length===0 ? (
            <WelcomeFlow onPick={(id)=>{ setActiveId(id); setAnswers(prev=>({ ...prev, [id]: prev[id]||{} })); }} />
          ) : (
            <GuidedQuestions
              tpl={tpl}
              answers={a}
              setAnswer={(id,val)=>setA(id,val)}
              onDone={()=>{ makeMarkdown(); setGuidedMode(false); }}
              onCancel={()=>{ setAnswers(prev=>({ ...prev, [activeId]: {} })); setGuidedMode(true); setOutput(""); }}
            />
          )}
        </div>
      </div>
    );
  }

  // ---------------- Mode éditeur classique ----------------
  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">🪶 Atelier de textes – Mode éditeur</h1>
          <button onClick={()=>{ setGuidedMode(true); setAnswers(prev=>({ ...prev, [activeId]: prev[activeId]||{} })); }} className="px-3 py-2 rounded-xl border">↩️ Retour au mode guidé</button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {['mag_trappeuses_intro','blog_seo_classique','grande_trappe_podcast_teaser','video_script','grande_trappe_brief','libre_personnalise']
            .map(id => TEMPLATES.find(t=>t.id===id))
            .map(t => (
              <button key={t.id} onClick={()=>setActiveId(t.id)} className={classJoin('px-3 py-1 rounded-full text-sm border', activeId===t.id ? 'bg-black text-white border-black' : 'bg-white hover:bg-neutral-100 border-neutral-300')}>{t.name}</button>
            ))}
        </div>

        <div className="space-y-5">
          {tpl.sections.map((s, si) => (
            <SectionCard key={si} title={s.title}>
              {(s.questions||[]).map((q, qi) => (
                <Field key={q.id||qi} type={q.type} label={q.label||q.id} value={a[q.id] || ''} onChange={(v)=>setA(q.id, v)} />
              ))}
            </SectionCard>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={makeMarkdown} className="px-4 py-2 rounded-xl bg-black text-white shadow">Générer le texte</button>
          <button onClick={()=>{ setAnswers(prev=>({ ...prev, [activeId]: {} })); setOutput(''); }} className="px-4 py-2 rounded-xl border border-neutral-300 bg-white">Réinitialiser ce modèle</button>
        </div>

        <div className="mt-6">
          <SectionCard title="Aperçu Markdown">
            <pre className="whitespace-pre-wrap text-sm bg-neutral-900 text-neutral-100 rounded-xl p-4 overflow-auto max-h-[360px]">{output || '(Le texte généré apparaîtra ici. Utilise le mode guidé pour te poser les questions.)'}</pre>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
