import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

function getEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }
  return "";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatMultilineHtml(value) {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

function createSupabaseServerClient() {
  const supabaseUrl = getEnv("SUPABASE_URL", "VITE_SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = getEnv("SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY");
  const supabaseKey = serviceRoleKey || anonKey;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

async function saveInquiry(payload) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { saved: false, reason: "Supabase non configure sur le serveur." };
  }

  const { data, error } = await supabase
    .from("agricultural_inquiries")
    .insert(payload)
    .select("id, name, email, message, reply_subject, reply_message, replied_at, email_sent_at, created_at")
    .single();

  if (error) {
    return { saved: false, reason: error.message };
  }

  return { saved: true, inquiry: data };
}

async function notifyTeam({ name, email, message }) {
  const smtpEmail = getEnv("GMAIL_SMTP_EMAIL");
  const smtpPassword = getEnv("GMAIL_SMTP_APP_PASSWORD");
  if (!smtpEmail || !smtpPassword) {
    throw new Error("Configuration Gmail manquante sur le serveur.");
  }

  const companyName = getEnv("MAIL_FROM_NAME") || "IR MIRINDI Business";
  const replyTo = getEnv("MAIL_REPLY_TO") || smtpEmail;
  const recipient = getEnv("CONTACT_FORM_TO_EMAIL", "MAIL_REPLY_TO", "GMAIL_SMTP_EMAIL") || smtpEmail;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpEmail,
      pass: smtpPassword,
    },
  });

  const subject = `Nouveau message du formulaire - ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #18181b; max-width: 640px; margin: 0 auto;">
      <h2 style="margin-bottom: 20px;">Nouveau message recu</h2>
      <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
      <p><strong>Email :</strong> ${escapeHtml(email)}</p>
      <p><strong>Message :</strong></p>
      <div style="margin-top: 12px; padding: 16px 20px; border-radius: 16px; background: #f4f4f5; border: 1px solid #e4e4e7;">
        ${formatMultilineHtml(message)}
      </div>
    </div>
  `;

  const text = [
    "Nouveau message recu",
    "",
    `Nom : ${name}`,
    `Email : ${email}`,
    "",
    "Message :",
    message,
  ].join("\n");

  await transporter.sendMail({
    from: `"${companyName}" <${smtpEmail}>`,
    to: recipient,
    replyTo: email || replyTo,
    subject,
    text,
    html,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Methode non autorisee." });
  }

  try {
    const { name = "", email = "", message = "" } = req.body ?? {};

    const normalizedName = String(name).trim();
    const normalizedEmail = String(email).trim();
    const normalizedMessage = String(message).trim();

    if (!normalizedName || !normalizedEmail || !normalizedMessage) {
      return res.status(400).json({ message: "Nom, email et message sont obligatoires." });
    }

    await notifyTeam({
      name: normalizedName,
      email: normalizedEmail,
      message: normalizedMessage,
    });

    const saveResult = await saveInquiry({
      name: normalizedName,
      email: normalizedEmail,
      message: normalizedMessage,
    });

    return res.status(200).json({
      ok: true,
      inquiry: saveResult.saved ? saveResult.inquiry : null,
      savedToDatabase: saveResult.saved,
      databaseMessage: saveResult.saved ? null : saveResult.reason,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue lors de l'envoi du message.";
    return res.status(500).json({ message });
  }
}
