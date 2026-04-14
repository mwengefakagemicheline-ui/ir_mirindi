import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type AgriculturalContactSettings = {
  locationLabel: string;
  locationValue: string;
  phoneLabel: string;
  phoneValue: string;
  emailLabel: string;
  emailValue: string;
};

export type AgriculturalPortfolioItem = {
  id: string;
  name: string;
  season: string;
  imageUrl: string;
  tips: string[];
  colSpan: string;
  sortOrder: number;
};

export type AgriculturalPageSettings = {
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  heroPrimaryCtaLabel: string;
  heroSecondaryCtaLabel: string;
  heroImageUrl: string;
  cultureBadge: string;
  cultureTitle: string;
  cultureHighlight: string;
  cultureDescription: string;
  principlesTitle: string;
  faqTitle: string;
  faqDescription: string;
  statsImageUrl: string;
  contactTitle: string;
  contactHighlight: string;
  contactDescription: string;
  contactBullets: string[];
  successTitle: string;
  successDescription: string;
  formTitle: string;
};

export type AgriculturalPrincipleItem = {
  id: string;
  title: string;
  description: string;
  iconName: string;
  sortOrder: number;
};

export type AgriculturalStatItem = {
  id: string;
  value: string;
  label: string;
  sortOrder: number;
};

export type AgriculturalFaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
};

const defaultAgriculturalContactSettings: AgriculturalContactSettings = {
  locationLabel: "Notre agence",
  locationValue: "République démocratique du Congo, Minova centre commercial, en face de l'hôtel Luna",
  phoneLabel: "Ligne directe",
  phoneValue: "+243 972492668 & +243 971904750",
  emailLabel: "Support expert",
  emailValue: "irmirindibusiness@gmail.com",
};

const defaultAgriculturalPortfolioItems: AgriculturalPortfolioItem[] = [
  { id: "fallback-mais", name: "Maïs", season: "Avril à sept.", imageUrl: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80", tips: ["Semis à 25 000 plants/ha", "Apport azoté fractionné", "Désherbage précoce"], colSpan: "col-span-1 md:col-span-4", sortOrder: 1 },
  { id: "fallback-haricot", name: "Haricot", season: "Mars à juil.", imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80", tips: ["Inoculation rhizobium", "Espacement 40×10 cm", "Éviter les excès d'eau"], colSpan: "col-span-1 md:col-span-2", sortOrder: 2 },
  { id: "fallback-manioc", name: "Manioc", season: "Toute l'année", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80", tips: ["Boutures saines 25 cm", "Sol bien drainé", "Buttage à 3 mois"], colSpan: "col-span-1 md:col-span-2", sortOrder: 3 },
  { id: "fallback-tomate", name: "Tomate", season: "Jan. à juin", imageUrl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80", tips: ["Tuteurage dès 30 cm", "Arrosage au pied", "Fongicide préventif"], colSpan: "col-span-1 md:col-span-4", sortOrder: 4 },
  { id: "fallback-riz", name: "Riz", season: "Juin à nov.", imageUrl: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&q=80", tips: ["Repiquage en ligne", "Gestion de l'eau", "Récolte à maturité"], colSpan: "col-span-1 md:col-span-3", sortOrder: 5 },
  { id: "fallback-soja", name: "Soja", season: "Mai à oct.", imageUrl: "https://images.unsplash.com/photo-1566218246241-934ad8b38b3b?w=800&q=80", tips: ["Inoculation", "Labour profond 25 cm", "Récolte avant verse"], colSpan: "col-span-1 md:col-span-3", sortOrder: 6 },
];

const defaultAgriculturalPageSettings: AgriculturalPageSettings = {
  heroBadge: "Agriculture de précision",
  heroTitle: "Cultivons",
  heroHighlight: "l'avenir.",
  heroDescription: "L'agronomie de précision pour maximiser vos parcelles.",
  heroPrimaryCtaLabel: "Explorer les cultures",
  heroSecondaryCtaLabel: "Voir nos conseils",
  heroImageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=90",
  cultureBadge: "Portefeuille agronomique",
  cultureTitle: "Des itinéraires techniques",
  cultureHighlight: "éprouvés sur le terrain.",
  cultureDescription: "Parcourez nos fiches cultures pour découvrir les meilleures pratiques adaptées à chaque variété, saison et type de sol.",
  principlesTitle: "Principes agronomiques.",
  faqTitle: "Expertise & Réponses",
  faqDescription: "Des réponses claires à vos questions les plus fréquentes sur la conduite de vos cultures et l'optimisation de vos rendements.",
  statsImageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=90",
  contactTitle: "Prêt à optimiser",
  contactHighlight: "votre exploitation ?",
  contactDescription: "Échangeons sur vos défis agronomiques. Nos experts vous accompagnent pour construire un itinéraire technique performant.",
  contactBullets: ["Consultation et diagnostic agronomique.", "Orientations à l'ouverture de projet agricole.", "Accompagnement complet des porteurs de projet.", "Vente de produits agricoles : cacao, tomate, pastèque, maïs, oignon, et autres produits."],
  successTitle: "Demande reçue",
  successDescription: "Un de nos agronomes étudie votre demande et vous recontactera sous 24h.",
  formTitle: "Démarrer une collaboration",
};

const defaultAgriculturalPrincipleItems: AgriculturalPrincipleItem[] = [
  { id: "principle-sol", title: "Analyse du sol", description: "Cartographie de la fertilité pour des apports précis et économiques.", iconName: "Microscope", sortOrder: 1 },
  { id: "principle-seeds", title: "Semences certifiées", description: "Sélection de variétés à haut potentiel de rendement et résilientes.", iconName: "Sprout", sortOrder: 2 },
  { id: "principle-follow", title: "Suivi agronomique", description: "Surveillance de la croissance et ajustement continu des itinéraires.", iconName: "LineChart", sortOrder: 3 },
];

const defaultAgriculturalStats: AgriculturalStatItem[] = [
  { id: "stat-1", value: "6+", label: "Cultures suivies", sortOrder: 1 },
  { id: "stat-2", value: "500+", label: "Agriculteurs", sortOrder: 2 },
  { id: "stat-3", value: "30 ans", label: "D'expertise", sortOrder: 3 },
  { id: "stat-4", value: "12", label: "Régions couvertes", sortOrder: 4 },
];

const defaultAgriculturalFaqItems: AgriculturalFaqItem[] = [
  { id: "faq-1", question: "Comment démarrer ma première saison de culture ?", answer: "Commencez par analyser votre sol, choisissez des variétés adaptées à votre région, et planifiez votre calendrier cultural en fonction des pluies.", sortOrder: 1 },
  { id: "faq-2", question: "Quelle est la meilleure période pour fertiliser ?", answer: "Appliquez les engrais de fond avant le semis. Fractionnez l'azote : 1/3 au semis, 2/3 en couverture lors de la montaison.", sortOrder: 2 },
  { id: "faq-3", question: "Comment lutter contre les ravageurs sans pesticides ?", answer: "Utilisez des variétés résistantes, pratiquez la rotation, favorisez les auxiliaires naturels (coccinelles, guêpes parasites) et installez des pièges à phéromones.", sortOrder: 3 },
  { id: "faq-4", question: "Quel rendement espérer pour le maïs ?", answer: "Un agriculteur bien encadré peut atteindre 3 à 5 tonnes/ha. Avec irrigation et intrants optimisés, certaines variétés hybrides dépassent 7 t/ha.", sortOrder: 4 },
];

function mapContact(row: any | null): AgriculturalContactSettings { if (!row) return defaultAgriculturalContactSettings; return { locationLabel: row.location_label ?? defaultAgriculturalContactSettings.locationLabel, locationValue: row.location_value ?? defaultAgriculturalContactSettings.locationValue, phoneLabel: row.phone_label ?? defaultAgriculturalContactSettings.phoneLabel, phoneValue: row.phone_value ?? defaultAgriculturalContactSettings.phoneValue, emailLabel: row.email_label ?? defaultAgriculturalContactSettings.emailLabel, emailValue: row.email_value ?? defaultAgriculturalContactSettings.emailValue }; }
function mapPortfolio(row: any): AgriculturalPortfolioItem { return { id: row.id, name: row.name, season: row.season, imageUrl: row.image_url, tips: Array.isArray(row.tips) ? row.tips.filter(Boolean) : [], colSpan: row.col_span ?? "col-span-1 md:col-span-3", sortOrder: row.sort_order ?? 0 }; }
function mapPageSettings(row: any | null): AgriculturalPageSettings { if (!row) return defaultAgriculturalPageSettings; return { heroBadge: row.hero_badge ?? defaultAgriculturalPageSettings.heroBadge, heroTitle: row.hero_title ?? defaultAgriculturalPageSettings.heroTitle, heroHighlight: row.hero_highlight ?? defaultAgriculturalPageSettings.heroHighlight, heroDescription: row.hero_description ?? defaultAgriculturalPageSettings.heroDescription, heroPrimaryCtaLabel: row.hero_primary_cta_label ?? defaultAgriculturalPageSettings.heroPrimaryCtaLabel, heroSecondaryCtaLabel: row.hero_secondary_cta_label ?? defaultAgriculturalPageSettings.heroSecondaryCtaLabel, heroImageUrl: row.hero_image_url ?? defaultAgriculturalPageSettings.heroImageUrl, cultureBadge: row.culture_badge ?? defaultAgriculturalPageSettings.cultureBadge, cultureTitle: row.culture_title ?? defaultAgriculturalPageSettings.cultureTitle, cultureHighlight: row.culture_highlight ?? defaultAgriculturalPageSettings.cultureHighlight, cultureDescription: row.culture_description ?? defaultAgriculturalPageSettings.cultureDescription, principlesTitle: row.principles_title ?? defaultAgriculturalPageSettings.principlesTitle, faqTitle: row.faq_title ?? defaultAgriculturalPageSettings.faqTitle, faqDescription: row.faq_description ?? defaultAgriculturalPageSettings.faqDescription, statsImageUrl: row.stats_image_url ?? defaultAgriculturalPageSettings.statsImageUrl, contactTitle: row.contact_title ?? defaultAgriculturalPageSettings.contactTitle, contactHighlight: row.contact_highlight ?? defaultAgriculturalPageSettings.contactHighlight, contactDescription: row.contact_description ?? defaultAgriculturalPageSettings.contactDescription, contactBullets: Array.isArray(row.contact_bullets) ? row.contact_bullets.filter(Boolean) : defaultAgriculturalPageSettings.contactBullets, successTitle: row.success_title ?? defaultAgriculturalPageSettings.successTitle, successDescription: row.success_description ?? defaultAgriculturalPageSettings.successDescription, formTitle: row.form_title ?? defaultAgriculturalPageSettings.formTitle }; }
function mapPrinciple(row: any): AgriculturalPrincipleItem { return { id: row.id, title: row.title, description: row.description, iconName: row.icon_name ?? "Leaf", sortOrder: row.sort_order ?? 0 }; }
function mapStat(row: any): AgriculturalStatItem { return { id: row.id, value: row.value, label: row.label, sortOrder: row.sort_order ?? 0 }; }
function mapFaq(row: any): AgriculturalFaqItem { return { id: row.id, question: row.question, answer: row.answer, sortOrder: row.sort_order ?? 0 }; }

export function useAgriculturalContactSettings() { return useQuery({ queryKey: ["agricultural-contact-settings"], queryFn: async () => { const { data, error } = await supabase.from("agricultural_contact_settings").select("location_label, location_value, phone_label, phone_value, email_label, email_value").eq("id", 1).maybeSingle(); if (error) throw error; return mapContact(data); } }); }
export function useUpsertAgriculturalContactSettings() { return useMutation({ mutationFn: async (payload: AgriculturalContactSettings) => { const { data, error } = await supabase.from("agricultural_contact_settings").upsert({ id: 1, location_label: payload.locationLabel, location_value: payload.locationValue, phone_label: payload.phoneLabel, phone_value: payload.phoneValue, email_label: payload.emailLabel, email_value: payload.emailValue, updated_at: new Date().toISOString() }, { onConflict: "id" }).select("location_label, location_value, phone_label, phone_value, email_label, email_value").single(); if (error) throw error; return mapContact(data); } }); }
export function useAgriculturalPortfolioItems() { return useQuery({ queryKey: ["agricultural-portfolio-items"], queryFn: async () => { const { data, error } = await supabase.from("agricultural_portfolio_items").select("id, name, season, image_url, tips, col_span, sort_order").order("sort_order", { ascending: true }); if (error) throw error; const items = (data ?? []).map(mapPortfolio); return items.length > 0 ? items : defaultAgriculturalPortfolioItems; } }); }
export function useUpdateAgriculturalPortfolioItem() { return useMutation({ mutationFn: async (payload: AgriculturalPortfolioItem) => { const { data, error } = await supabase.from("agricultural_portfolio_items").update({ name: payload.name, season: payload.season, image_url: payload.imageUrl, tips: payload.tips, col_span: payload.colSpan, sort_order: payload.sortOrder, updated_at: new Date().toISOString() }).eq("id", payload.id).select("id, name, season, image_url, tips, col_span, sort_order").single(); if (error) throw error; return mapPortfolio(data); } }); }
export function useAgriculturalPageSettings() { return useQuery({ queryKey: ["agricultural-page-settings"], queryFn: async () => { const { data, error } = await supabase.from("agricultural_page_settings").select("hero_badge, hero_title, hero_highlight, hero_description, hero_primary_cta_label, hero_secondary_cta_label, hero_image_url, culture_badge, culture_title, culture_highlight, culture_description, principles_title, faq_title, faq_description, stats_image_url, contact_title, contact_highlight, contact_description, contact_bullets, success_title, success_description, form_title").eq("id", 1).maybeSingle(); if (error) throw error; return mapPageSettings(data); } }); }
export function useUpsertAgriculturalPageSettings() { return useMutation({ mutationFn: async (payload: AgriculturalPageSettings) => { const { data, error } = await supabase.from("agricultural_page_settings").upsert({ id: 1, hero_badge: payload.heroBadge, hero_title: payload.heroTitle, hero_highlight: payload.heroHighlight, hero_description: payload.heroDescription, hero_primary_cta_label: payload.heroPrimaryCtaLabel, hero_secondary_cta_label: payload.heroSecondaryCtaLabel, hero_image_url: payload.heroImageUrl, culture_badge: payload.cultureBadge, culture_title: payload.cultureTitle, culture_highlight: payload.cultureHighlight, culture_description: payload.cultureDescription, principles_title: payload.principlesTitle, faq_title: payload.faqTitle, faq_description: payload.faqDescription, stats_image_url: payload.statsImageUrl, contact_title: payload.contactTitle, contact_highlight: payload.contactHighlight, contact_description: payload.contactDescription, contact_bullets: payload.contactBullets, success_title: payload.successTitle, success_description: payload.successDescription, form_title: payload.formTitle, updated_at: new Date().toISOString() }, { onConflict: "id" }).select("hero_badge, hero_title, hero_highlight, hero_description, hero_primary_cta_label, hero_secondary_cta_label, hero_image_url, culture_badge, culture_title, culture_highlight, culture_description, principles_title, faq_title, faq_description, stats_image_url, contact_title, contact_highlight, contact_description, contact_bullets, success_title, success_description, form_title").single(); if (error) throw error; return mapPageSettings(data); } }); }
export function useAgriculturalPrincipleItems() { return useQuery({ queryKey: ["agricultural-principle-items"], queryFn: async () => { const { data, error } = await supabase.from("agricultural_principle_items").select("id, title, description, icon_name, sort_order").order("sort_order", { ascending: true }); if (error) throw error; const items = (data ?? []).map(mapPrinciple); return items.length > 0 ? items : defaultAgriculturalPrincipleItems; } }); }
export function useUpdateAgriculturalPrincipleItem() { return useMutation({ mutationFn: async (payload: AgriculturalPrincipleItem) => { const { data, error } = await supabase.from("agricultural_principle_items").update({ title: payload.title, description: payload.description, icon_name: payload.iconName, sort_order: payload.sortOrder, updated_at: new Date().toISOString() }).eq("id", payload.id).select("id, title, description, icon_name, sort_order").single(); if (error) throw error; return mapPrinciple(data); } }); }
export function useAgriculturalStats() { return useQuery({ queryKey: ["agricultural-stats"], queryFn: async () => { const { data, error } = await supabase.from("agricultural_stats").select("id, value, label, sort_order").order("sort_order", { ascending: true }); if (error) throw error; const items = (data ?? []).map(mapStat); return items.length > 0 ? items : defaultAgriculturalStats; } }); }
export function useUpdateAgriculturalStat() { return useMutation({ mutationFn: async (payload: AgriculturalStatItem) => { const { data, error } = await supabase.from("agricultural_stats").update({ value: payload.value, label: payload.label, sort_order: payload.sortOrder, updated_at: new Date().toISOString() }).eq("id", payload.id).select("id, value, label, sort_order").single(); if (error) throw error; return mapStat(data); } }); }
export function useAgriculturalFaqItems() { return useQuery({ queryKey: ["agricultural-faq-items"], queryFn: async () => { const { data, error } = await supabase.from("agricultural_faq_items").select("id, question, answer, sort_order").order("sort_order", { ascending: true }); if (error) throw error; const items = (data ?? []).map(mapFaq); return items.length > 0 ? items : defaultAgriculturalFaqItems; } }); }
export function useUpdateAgriculturalFaqItem() { return useMutation({ mutationFn: async (payload: AgriculturalFaqItem) => { const { data, error } = await supabase.from("agricultural_faq_items").update({ question: payload.question, answer: payload.answer, sort_order: payload.sortOrder, updated_at: new Date().toISOString() }).eq("id", payload.id).select("id, question, answer, sort_order").single(); if (error) throw error; return mapFaq(data); } }); }