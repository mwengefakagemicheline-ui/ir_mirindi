import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Leaf, Droplets, Sun, Wind, ArrowRight, CheckCircle2, 
  MapPin, Mail, Phone, ChevronDown, ArrowDown, 
  Microscope, Sprout, LineChart, Send 
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
  }),
};

const cultures = [
  {
    name: "Ma�s",
    saison: "Avril – Sept.",
    image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80",
    conseils: ["Semis � 25 000 plants/ha", "Apport azot� fractionn�", "D�sherbage pr�coce"],
    colSpan: "col-span-1 md:col-span-4",
  },
  {
    name: "Haricot",
    saison: "Mars – Juil.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80",
    conseils: ["Inoculation rhizobium", "Espacement 40×10 cm", "Éviter exc�s d'eau"],
    colSpan: "col-span-1 md:col-span-2",
  },
  {
    name: "Manioc",
    saison: "Toute l'ann�e",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
    conseils: ["Boutures saines 25 cm", "Sol bien drain�", "Buttage � 3 mois"],
    colSpan: "col-span-1 md:col-span-2",
  },
  {
    name: "Tomate",
    saison: "Jan. – Juin",
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80",
    conseils: ["Tuteurage d�s 30 cm", "Arrosage au pied", "Fongicide pr�ventif"],
    colSpan: "col-span-1 md:col-span-4",
  },
  {
    name: "Riz",
    saison: "Juin – Nov.",
    image: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&q=80",
    conseils: ["Repiquage en ligne", "Gestion de l'eau", "R�colte � maturit�"],
    colSpan: "col-span-1 md:col-span-3",
  },
  {
    name: "Soja",
    saison: "Mai – Oct.",
    image: "https://images.unsplash.com/photo-1566218246241-934ad8b38b3b?w=800&q=80",
    conseils: ["Inoculation", "Labour profond 25cm", "R�colte avant verse"],
    colSpan: "col-span-1 md:col-span-3",
  },
];

const conseils = [
  {
    icon: <Leaf className="w-6 h-6" />,
    titre: "Gestion du sol",
    texte: "Analysez votre sol chaque saison. Un pH entre 6 et 7 assure la disponibilit� optimale des nutriments. Pratiquez la rotation des cultures pour maintenir la fertilit� naturelle.",
  },
  {
    icon: <Droplets className="w-6 h-6" />,
    titre: "Irrigation intelligente",
    texte: "Arrosez t�t le matin pour r�duire l'�vaporation. Adoptez le goutte-�-goutte pour �conomiser jusqu'� 60 % d'eau. Évitez les exc�s qui favorisent les maladies fongiques.",
  },
  {
    icon: <Sun className="w-6 h-6" />,
    titre: "Protection phytosanitaire",
    texte: "Inspectez vos cultures deux fois par semaine. Privil�giez la lutte int�gr�e avant les traitements chimiques. Traitez en soir�e pour prot�ger les pollinisateurs.",
  },
  {
    icon: <Wind className="w-6 h-6" />,
    titre: "Gestion post-r�colte",
    texte: "S�chez bien les grains avant stockage (humidit� < 13 %). Utilisez des sacs herm�tiques PICS pour �viter les insectes. Tenez un registre de vos stocks et ventes.",
  },
];

const stats = [
  { valeur: "6+", label: "Cultures suivies" },
  { valeur: "500+", label: "Agriculteurs" },
  { valeur: "30 ans", label: "D'expertise" },
  { valeur: "12", label: "R�gions couvertes" },
];

export function Agricole() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ nom: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const faqs = [
    { q: "Comment d�marrer ma premi�re saison de culture ?", r: "Commencez par analyser votre sol, choisissez des vari�t�s adapt�es � votre r�gion, et planifiez votre calendrier cultural en fonction des pluies." },
    { q: "Quelle est la meilleure p�riode pour fertiliser ?", r: "Appliquez les engrais de fond avant le semis. Fractionnez l'azote : 1/3 au semis, 2/3 en couverture lors de la montaison." },
    { q: "Comment lutter contre les ravageurs sans pesticides ?", r: "Utilisez des vari�t�s r�sistantes, pratiquez la rotation, favorisez les auxiliaires naturels (coccinelles, gu�pes parasites) et installez des pi�ges � ph�romones." },
    { q: "Quel rendement esp�rer pour le ma�s ?", r: "Un agriculteur bien encadr� peut atteindre 3 � 5 tonnes/ha. Avec irrigation et intrants optimis�s, certaines vari�t�s hybrides d�passent 7 t/ha." },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="bg-white selection:bg-green-500/30 selection:text-green-900">

      {/* ─── HERO ─── */}
      <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=90"
            alt="Agriculture"
            className="w-full h-full object-cover scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.div
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-xs font-medium tracking-wide mb-8"
            >
              <span>🌱</span> Agriculture de pr�cision
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-6xl md:text-8xl font-display font-bold text-white leading-[1.1] mb-6 tracking-tight"
            >
              Cultivons <br />
              <span className="text-[#4ade80]">l'avenir.</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="text-white/60 text-lg md:text-xl font-light mb-10 max-w-xl"
            >
              L'agronomie de pr�cision pour maximiser vos parcelles.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="flex flex-wrap items-center gap-5">
              <a
                href="#cultures"
                className="inline-flex items-center gap-2 bg-[#4ade80] hover:bg-[#22c55e] text-green-950 px-8 py-4 rounded-full text-sm font-bold tracking-wide transition-all duration-300 shadow-[0_0_40px_-10px_rgba(74,222,128,0.5)] hover:scale-105"
              >
                Explorer les cultures <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#conseils"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white hover:border-white hover:bg-white/10 px-8 py-4 rounded-full text-sm font-bold tracking-wide transition-all duration-300"
              >
                Voir nos conseils
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar DANS le hero */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div 
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex flex-col border-l border-white/10 pl-6 first:border-0 first:pl-0"
              >
                <span className="text-3xl md:text-4xl font-display font-bold text-white mb-1">{s.valeur}</span>
                <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-32 right-8 md:right-16 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] origin-center -rotate-90 mb-6">Scroll</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm"
          >
            <ArrowDown className="w-4 h-4 text-white/70" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── CULTURES (Grille Magazine) ─── */}
      <section id="cultures" className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
        >
          <div className="max-w-2xl">
            <span className="text-[#4ade80] text-sm font-bold tracking-[0.2em] uppercase mb-4 block">Portefeuille Agronomique</span>
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-zinc-900 leading-tight">
              Des itin�raires techniques <br className="hidden md:block" />
              <span className="text-zinc-400">�prouv�s sur le terrain.</span>
            </h2>
          </div>
          <p className="text-zinc-500 max-w-sm text-sm md:text-base leading-relaxed">
            Parcourez nos fiches cultures pour d�couvrir les meilleures pratiques adapt�es � chaque vari�t�, saison et type de sol.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6 auto-rows-[350px]">
          {cultures.map((c, i) => (
            <motion.div
              key={c.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`relative overflow-hidden rounded-2xl group ${c.colSpan}`}
            >
              {/* Background Image */}
              <img 
                src={c.image} 
                alt={c.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Dark Gradient Overlay for resting state */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-0" />
              
              {/* Hover Green Overlay */}
              <div className="absolute inset-0 bg-[#064e3b]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm flex flex-col justify-center p-8" />

              {/* Top Badge */}
              <div className="absolute top-6 right-6 z-10">
                <span className="bg-white/90 backdrop-blur-md text-zinc-900 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                  {c.saison}
                </span>
              </div>

              {/* Content - Resting */}
              <div className="absolute bottom-0 left-0 p-8 z-10 w-full transition-transform duration-500 group-hover:translate-y-8 group-hover:opacity-0">
                <h3 className="text-3xl font-display font-semibold text-white mb-1">{c.name}</h3>
                <p className="text-white/70 text-sm font-medium tracking-wide uppercase">{c.saison}</p>
              </div>

              {/* Content - Hover */}
              <div className="absolute inset-0 p-8 z-20 flex flex-col justify-center opacity-0 translate-y-8 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                <h3 className="text-4xl font-display font-semibold text-white mb-6 border-b border-white/20 pb-6">{c.name}</h3>
                <ul className="space-y-4">
                  {c.conseils.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-white/90 text-sm font-medium">
                      <CheckCircle2 className="w-5 h-5 text-[#4ade80] shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── NOTRE APPROCHE ─── */}
      <section className="py-24 bg-white border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
            {[
              { 
                icon: <Microscope className="w-8 h-8 text-green-600" />, 
                title: "Analyse du sol", 
                desc: "Cartographie de la fertilit� pour des apports pr�cis et �conomiques." 
              },
              { 
                icon: <Sprout className="w-8 h-8 text-green-600" />, 
                title: "Semences certifi�es", 
                desc: "S�lection de vari�t�s � haut potentiel de rendement et r�silientes." 
              },
              { 
                icon: <LineChart className="w-8 h-8 text-green-600" />, 
                title: "Suivi agronomique", 
                desc: "Surveillance de la croissance et ajustement continu des itin�raires." 
              },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="md:px-12 first:md:pl-0 last:md:pr-0 pt-12 md:pt-0 first:pt-0 flex items-start gap-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-xl font-display font-semibold text-zinc-900 mb-2">{item.title}</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONSEILS ─── */}
      <section id="conseils" className="py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 md:mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-white mt-3">
              Principes agronomiques.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {conseils.map((c, i) => (
              <motion.div
                key={c.titre}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 lg:p-10 overflow-hidden group hover:border-zinc-700 transition-colors"
              >
                {/* Grand Num�ro de fond */}
                <div className="absolute -right-8 -top-12 text-[150px] font-display font-bold text-zinc-800/30 select-none pointer-events-none group-hover:text-zinc-800/50 transition-colors">
                  0{i + 1}
                </div>

                <div className="relative z-10">
                  <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center text-[#4ade80] mb-8 shadow-[0_0_30px_-5px_rgba(74,222,128,0.2)]">
                    {c.icon}
                  </div>
                  <h4 className="font-display font-semibold text-white text-2xl mb-4">{c.titre}</h4>
                  <p className="text-zinc-400 leading-relaxed">{c.texte}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATISTIQUES ANIMÉES ─── */}
      <section className="relative py-32 overflow-hidden border-y border-zinc-800">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=90" 
            alt="Champ agricole" 
            className="w-full h-full object-cover blur-sm scale-110"
          />
          <div className="absolute inset-0 bg-[#064e3b]/90 mix-blend-multiply" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-center">
            {[
              { val: "92%", text: "R�coltes am�lior�es" },
              { val: "8 ans", text: "Exp�rience" },
              { val: "1 200+", text: "Agriculteurs" },
              { val: "24h", text: "Support" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, delay: i * 0.1 }}
              >
                <div className="text-6xl md:text-7xl font-display font-bold text-white mb-4 tracking-tighter drop-shadow-lg">
                  {stat.val}
                </div>
                <div className="text-green-200 font-medium tracking-wide uppercase text-sm">{stat.text}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ (Premium Accordion) ─── */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-zinc-900 mb-6">
              Expertise & R�ponses
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Des r�ponses claires � vos questions les plus fr�quentes sur la conduite de vos cultures et l'optimisation de vos rendements.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="group border-b border-zinc-200 pb-6"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-start gap-6 text-left py-2 outline-none"
                >
                  <span className="text-[#4ade80] font-display font-bold text-xl mt-1 shrink-0">
                    0{i + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className={`text-xl font-display font-medium transition-colors ${openFaq === i ? 'text-zinc-900' : 'text-zinc-700 group-hover:text-zinc-900'}`}>
                      {faq.q}
                    </h3>
                    
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-zinc-500 leading-relaxed pr-8">
                            {faq.r}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 shrink-0 transition-transform duration-500 mt-1 ${openFaq === i ? "rotate-180 text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"}`}
                  />
                </button>
                {/* Animated Line Separator */}
                <div className="relative h-[2px] w-full mt-6 bg-transparent">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-[#4ade80]"
                    initial={{ width: 0 }}
                    animate={{ width: openFaq === i ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 to-[#064e3b] z-0" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Infos */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-display font-semibold text-white mb-6">
                Pr�t � optimiser <br />
                <span className="text-[#4ade80]">votre exploitation ?</span>
              </h2>
              <p className="text-zinc-300 text-lg leading-relaxed mb-12 max-w-lg">
                Échangeons sur vos d�fis agronomiques. Nos experts vous accompagnent pour construire un itin�raire technique performant.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: <MapPin className="w-6 h-6" />, label: "Notre agence", value: "P�le Agtech, Innovation Valley" },
                  { icon: <Phone className="w-6 h-6" />, label: "Ligne directe", value: "+243 972492668" },
                  { icon: <Mail className="w-6 h-6" />, label: "Support expert", value: "agronomie@startup.co" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="w-14 h-14 rounded-xl bg-[#4ade80]/20 flex items-center justify-center text-[#4ade80]">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold mb-1">{item.label}</p>
                      <p className="text-white font-medium text-lg">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Formulaire */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2rem] p-10 lg:p-12 shadow-2xl relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center py-16 flex flex-col items-center justify-center h-full"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6"
                    >
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </motion.div>
                    <h3 className="text-3xl font-display font-semibold text-zinc-900 mb-4">Demande re�ue</h3>
                    <p className="text-zinc-500 text-lg mb-8 max-w-xs mx-auto">
                      Un de nos agronomes �tudie votre demande et vous recontactera sous 24h.
                    </p>
                    <button 
                      onClick={() => setSent(false)} 
                      className="text-[#4ade80] font-semibold hover:text-green-600 transition-colors border-b-2 border-transparent hover:border-green-600 pb-1"
                    >
                      Nouvelle demande
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="space-y-8"
                  >
                    <h3 className="text-2xl font-display font-semibold text-zinc-900 mb-8">D�marrer une collaboration</h3>
                    
                    <div className="space-y-6">
                      <div className="relative">
                        <input
                          type="text"
                          id="nom"
                          required
                          value={form.nom}
                          onChange={(e) => setForm({ ...form, nom: e.target.value })}
                          className="peer w-full border-b-2 border-zinc-200 bg-transparent px-0 py-3 text-lg text-zinc-900 placeholder-transparent focus:border-[#4ade80] focus:outline-none transition-colors"
                          placeholder="Jean Dupont"
                        />
                        <label 
                          htmlFor="nom" 
                          className="absolute left-0 -top-3.5 text-sm text-zinc-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[#4ade80] font-medium pointer-events-none"
                        >
                          Votre nom complet
                        </label>
                      </div>

                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="peer w-full border-b-2 border-zinc-200 bg-transparent px-0 py-3 text-lg text-zinc-900 placeholder-transparent focus:border-[#4ade80] focus:outline-none transition-colors"
                          placeholder="email@domaine.com"
                        />
                        <label 
                          htmlFor="email" 
                          className="absolute left-0 -top-3.5 text-sm text-zinc-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[#4ade80] font-medium pointer-events-none"
                        >
                          Adresse email professionnelle
                        </label>
                      </div>

                      <div className="relative">
                        <textarea
                          id="message"
                          required
                          rows={4}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="peer w-full border-b-2 border-zinc-200 bg-transparent px-0 py-3 text-lg text-zinc-900 placeholder-transparent focus:border-[#4ade80] focus:outline-none transition-colors resize-none"
                          placeholder="D�crivez votre besoin"
                        />
                        <label 
                          htmlFor="message" 
                          className="absolute left-0 -top-3.5 text-sm text-zinc-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[#4ade80] font-medium pointer-events-none"
                        >
                          D�tails de l'exploitation
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#166534] hover:bg-[#14532d] text-white font-bold text-lg py-5 rounded-xl transition-all duration-300 shadow-xl shadow-green-900/20 flex items-center justify-center gap-3 group mt-4"
                    >
                      Envoyer la demande
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}

