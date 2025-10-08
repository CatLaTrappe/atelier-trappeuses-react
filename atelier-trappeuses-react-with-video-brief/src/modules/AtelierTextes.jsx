  import React, { useEffect, useMemo, useState } from 'react'

  const ls = {
    get: (k, fallback) => {
      try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback } catch { return fallback }
    },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
  }

  const classJoin = (...c) => c.filter(Boolean).join(' ')

  // ---------- Full templates (from MVP 1.0) ----------
  const TEMPLATES = [
    {
      id: 'mag_trappeuses_intro',
      name: '📰 Magazine – Intro Trappeuses du Québec',
      audience: 'Grand public + trappeuses/curieuses',
      tone: 'Chaleureux, informatif, inclusif, missionnel',
      sections: [
        { title: 'Contexte & Mission', questions: [
          { id: 'qui', label: 'Qui parle ? (TUQ, Cathy, rôle)', placeholder: 'Ex.: Cathy Naud, fondatrice de Trappeuses du Québec…' },
          { id: 'mission', label: 'Mission en une phrase forte', placeholder: 'Féminiser la trappe, démocratiser la pratique, promouvoir la fourrure naturelle…' },
          { id: 'valeurs', label: 'Valeurs à mettre de l’avant', placeholder: 'Respect, partage, entraide, communauté, valorisation des femmes, mise en valeur des ressources' },
        ]},
        { title: 'Pourquoi maintenant ?', questions: [
          { id: 'pourquoi', label: 'Contexte / enjeu actuel', placeholder: 'Ex.: Acceptabilité sociale, disparition d’habitats, clichés…' },
          { id: 'public', label: 'À qui on s’adresse ?', placeholder: 'Trappeuses, curieuses, grand public, médias…' },
        ]},
        { title: 'Preuves & communauté', questions: [
          { id: 'preuves', label: 'Exemples concrets / réalisations', placeholder: 'Groupe Facebook (1600+), salons, initiatives, calendrier, retraites…' },
          { id: 'temoins', label: 'Témoignages / anecdotes (facultatif)', placeholder: 'Une rencontre marquante, un changement d’opinion…' },
        ]},
        { title: 'Appel à l’action', questions: [
          { id: 'cta', label: 'Quoi demander au lecteur ?', placeholder: 'S’abonner, venir au salon, découvrir la fourrure naturelle, poser des questions…' },
          { id: 'liens', label: 'Liens / repères (facultatif)', placeholder: 'YouTube, Facebook, Spotify/Apple Podcast, courriel…' },
        ]},
      ],
      md: (a) => `# Trappeuses du Québec — Présentation

**Par :** ${a.qui || ''}

## Notre mission
${a.mission || ''}

**Valeurs :** ${a.valeurs || ''}

## Pourquoi maintenant ?
**Contexte :** ${a.pourquoi || ''}

**Public visé :** ${a.public || ''}

## La force de la communauté
${a.preuves || ''}

${a.temoins ? `> Témoignage / anecdote
> ${a.temoins}` : ''}

## Et maintenant ?
${a.cta || ''}

${a.liens ? `---
**Pour aller plus loin :**
${a.liens}` : ''}
`
    },
    {
      id: 'blog_seo_classique',
      name: '📝 Blog – Article SEO classique',
      audience: 'Curieuses, grand public, communauté',
      tone: 'Pédagogique, accessible, chaleureux',
      sections: [
        { title: 'Cadrage', questions: [
          { id: 'titre', label: 'Titre (H1)', placeholder: 'Ex.: Comprendre la régulation des populations : rôle des trappeurs' },
          { id: 'angle', label: 'Angle / promesse', placeholder: 'Ce que la lectrice va apprendre ou ressentir' },
          { id: 'personas', label: 'Public / persona', placeholder: 'Curieuse qui hésite, néophyte, citoyenne écolo…' },
          { id: 'mots', label: 'Mots-clés principaux', placeholder: 'trappe, régulation, écosystème, fourrure naturelle, éthique…' },
        ]},
        { title: 'Plan rapide', questions: [
          { id: 'plan', type: 'textarea', label: 'Plan en 4-6 points (H2)', placeholder: '1) Mise en contexte\n2) Pourquoi la régulation est nécessaire\n3) Comment on s’assure d’être éthique\n4) Exemples vécus\n5) Réponses aux idées reçues\n6) Conclusion + appel à l’action' },
        ]},
        { title: 'Preuves & exemples', questions: [
          { id: 'exemples', type: 'textarea', label: 'Exemples vécus / données / sources', placeholder: 'Petites données, anecdotes de terrain, références (sans URL complètes si tu ne veux pas)' },
        ]},
        { title: 'CTA & méta', questions: [
          { id: 'cta', label: 'Appel à l’action (CTA)', placeholder: 'S’abonner, commenter, partager, poser une question…' },
          { id: 'chapo', type: 'textarea', label: 'Chapeau (2-3 phrases)', placeholder: 'Petit résumé engageant qui apparaît avant le H1' },
          { id: 'desc', type: 'textarea', label: 'Méta description (<= 160 caractères)', placeholder: 'Résumé SEO pour Google' },
        ]},
      ],
      md: (a) => `---
Title: ${a.titre || 'Titre à définir'}
Description: ${a.desc || ''}
Keywords: ${a.mots || ''}
---

${a.chapo ? `> ${a.chapo}

` : ''}# ${a.titre || 'Titre à définir'}

*Public visé :* ${a.personas || ''}

**Angle / promesse :** ${a.angle || ''}

## Plan
${a.plan || '(À détailler)'}

## Exemples, preuves et références
${a.exemples || ''}

---
${a.cta || ''}
`
    },
    {
      id: 'grande_trappe_podcast_teaser',
      name: '🎙️ La Grande Trappe – Teaser d’épisode',
      audience: 'Abonnées podcast + YouTube',
      tone: 'Punché, franc, drôle au besoin',
      sections: [
        { title: 'Infos de base', questions: [
          { id: 'num', label: 'Numéro d’épisode', placeholder: 'Ex.: 10' },
          { id: 'titre', label: 'Titre d’épisode', placeholder: 'Ex.: Rapaces & pièges – avec Dr Guy Fitzgerald' },
          { id: 'inv', label: 'Invité(e)', placeholder: 'Nom, rôle' },
        ]},
        { title: 'Promesse', questions: [
          { id: 'accroche', type: 'textarea', label: 'Accroche percutante (1-2 phrases)', placeholder: 'Un crochet qui pique la curiosité, ton assumé et clair' },
          { id: 'points', type: 'textarea', label: '3-5 sujets clés en puces', placeholder: '• Sujet 1\n• Sujet 2\n• Sujet 3' },
        ]},
        { title: 'Liens', questions: [
          { id: 'liens', type: 'textarea', label: 'Plateformes / mentions', placeholder: 'Spotify, Apple, YouTube, partenaires…' },
        ]},
      ],
      md: (a) => `🎙️ *La Grande Trappe* — Teaser

**Épisode ${a.num || '?'} — ${a.titre || 'Titre à venir'}**${a.inv ? ` — avec ${a.inv}` : ''}

${a.accroche || ''}

${a.points || ''}

${a.liens ? `🔗 ${a.liens}` : ''}
`
    },
    {
      id: 'libre_personnalise',
      name: '🧩 Modèle libre – Crée tes propres questions',
      audience: 'À définir',
      tone: 'À définir',
      custom: true,
      sections: [
        { title: 'Questions personnalisées', questions: [
          { id: 'custom_0', label: 'Question 1' },
          { id: 'custom_1', label: 'Question 2' },
          { id: 'custom_2', label: 'Question 3' },
        ]}
      ],
      md: (a) => `# Brouillon

${Object.entries(a).map(([k,v])=>`**${k}**
${v}
`).join('\n')}`
    },
  ]

  function SectionCard({ title, children }) {
    return (
      <div className="card">
        <h3>{title}</h3>
        <div className="space">{children}</div>
      </div>
    )
  }

  function Field({ label, value, onChange, placeholder, type }) {
    const isBig = type === 'textarea'
    return (
      <label className="field">
        <div className="field-label">{label}</div>
        {isBig ? (
          <textarea className="textarea" value={value || ''} onChange={e=>onChange(e.target.value)} placeholder={placeholder || ''} />
        ) : (
          <input className="input" value={value || ''} onChange={e=>onChange(e.target.value)} placeholder={placeholder || ''} />
        )}
      </label>
    )
  }

  export default function AtelierTextes() {
    const [activeId, setActiveId] = useState(ls.get('atelier.activeId', 'mag_trappeuses_intro'))
    const [answers, setAnswers] = useState(ls.get('atelier.answers', {}))
    const [output, setOutput] = useState('')
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [customQs, setCustomQs] = useState(ls.get('atelier.customQs', ['Question 1', 'Question 2', 'Question 3']))

    const tpl = useMemo(()=> TEMPLATES.find(t => t.id === activeId) || TEMPLATES[0], [activeId])
    const a = answers[activeId] || {}

    useEffect(()=>{ ls.set('atelier.activeId', activeId) }, [activeId])
    useEffect(()=>{ ls.set('atelier.answers', answers) }, [answers])
    useEffect(()=>{ ls.set('atelier.customQs', customQs) }, [customQs])

    const setA = (qid, v) => setAnswers(prev => ({ ...prev, [activeId]: { ...(prev[activeId]||{}), [qid]: v } }))

    const makeMarkdown = () => {
      const maker = tpl.md || ((x)=>JSON.stringify(x,null,2))
      const md = maker(a)
      setOutput(md)
      try { navigator.clipboard.writeText(md) } catch {}
    }

    const downloadMd = () => {
      const blob = new Blob([output || (tpl.md ? tpl.md(a) : '')], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const stamp = new Date().toISOString().slice(0,10)
      link.href = url
      link.download = `${tpl.name.replace(/\s+/g,'_')}_${stamp}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    return (
      <div className="app">
        {/* Sidebar */}
        <aside className="sidebar">
          <div>
            <h2>🪶 Atelier de textes</h2>
            <div className="group-label">🧭 Essentiels</div>
            {[
              'mag_trappeuses_intro',
              'blog_seo_classique',
              'grande_trappe_podcast_teaser',
              'video_script',
              'grande_trappe_brief'
            ].map(id => TEMPLATES.find(t=>t.id===id)).map(t => (
              <button key={t.id} className={classJoin('nav-btn', activeId===t.id && 'active')} onClick={()=>setActiveId(t.id)}>{t.name}</button>
            ))}
            <button className="advanced-toggle" onClick={()=>setShowAdvanced(!showAdvanced)}>
              ⚙️ Modules avancés <span>{showAdvanced ? '▼' : '►'}</span>
            </button>
            {showAdvanced && (
              <div className="advanced-list">
                <label><input type="checkbox" checked readOnly/> 🤝 Commandite (à venir)</label>
                <label><input type="checkbox" checked readOnly/> 🎬 Script vidéo (à venir)</label>
                <label><input type="checkbox" checked readOnly/> 🧠 Brief LGT (à venir)</label>
                <label><input type="checkbox" checked readOnly/> 🪵 Le Coureur des Bois (à venir)</label>
                <label><input type="checkbox" checked readOnly/> ⚡ Réponses aux préjugés (à venir)</label>
                <label><input type="checkbox" checked readOnly/> 🍲 Recette (à venir)</label>
              </div>
            )}
          </div>
          <div className="version">v1.0 – Standalone</div>
        </aside>

        {/* Main */}
        <main className="content">
          <div className="title">🧾 {tpl.name}</div>

          {/* Toolbar */}
          <div className="toolbar" style={{marginBottom:12}}>
            <button className="btn primary" onClick={makeMarkdown}>Générer le texte</button>
            <button className="btn" onClick={downloadMd}>Télécharger .md</button>
          </div>

          {/* Meta */}
          <div className="grid grid-3" style={{marginBottom:16}}>
            <div className="card"><strong>À qui on parle ?</strong><div style={{color:'var(--muted)'}}>{tpl.audience}</div></div>
            <div className="card"><strong>Ton / voix</strong><div style={{color:'var(--muted)'}}>{tpl.tone}</div></div>
            <div className="card"><strong>Astuce</strong><div style={{color:'var(--muted)'}}>Simple, précis, concret. Une idée par paragraphe. 💪</div></div>
          </div>

          {/* Form */}
          <div className="grid" style={{marginBottom:16}}>
            {tpl.sections.map((s, si) => (
              <div key={si} className="card">
                <h3>{s.title}</h3>
                {s.questions.map((q, qi) => (
                  <Field key={q.id||qi} type={q.type} label={q.label||q.id} value={a[q.id]||''} onChange={(v)=>setA(q.id,v)} placeholder={q.placeholder} />
                ))}
              </div>
            ))}

            {tpl.custom && (
              <div className="card">
                <h3>Personnalise tes questions</h3>
                {['custom_0','custom_1','custom_2'].map((id, idx) => (
                  <Field key={id} label={`Question ${idx+1}`} value={a[id]||''} onChange={(v)=>setA(id,v)} />
                ))}
              </div>
            )}
          </div>

          {/* Output */}
          <div className="card">
            <h3>Aperçu Markdown (copié au clic sur Générer)</h3>
            <pre>{output || '(Rédige tes réponses, puis clique sur Générer)'}</pre>
          </div>
        </main>
      </div>
    )
  }
