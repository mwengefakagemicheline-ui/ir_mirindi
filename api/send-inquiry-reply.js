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

function parseAdminEmails(raw) {
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
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

async function getAuthorizedUser(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return null;
  }

  const supabaseUrl = getEnv("SUPABASE_URL", "VITE_SUPABASE_URL");
  const supabaseAnonKey = getEnv("SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variables Supabase manquantes sur le serveur.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) {
    return null;
  }

  const allowedAdminEmails = parseAdminEmails(getEnv("ADMIN_EMAILS", "VITE_ADMIN_EMAILS"));
  if (allowedAdminEmails.length === 0) {
    return data.user;
  }

  return allowedAdminEmails.includes(data.user.email.toLowerCase()) ? data.user : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Méthode non autorisée." });
  }

  try {
    const user = await getAuthorizedUser(req);
    if (!user) {
      return res.status(401).json({ message: "Session admin invalide." });
    }

    const smtpEmail = getEnv("GMAIL_SMTP_EMAIL");
    const smtpPassword = getEnv("GMAIL_SMTP_APP_PASSWORD");
    if (!smtpEmail || !smtpPassword) {
      return res.status(500).json({ message: "Configuration Gmail manquante sur le serveur." });
    }

    const {
      toEmail = "",
      toName = "",
      replyMessage = "",
      originalMessage = "",
    } = req.body ?? {};

    const recipient = String(toEmail).trim();
    const recipientName = String(toName).trim();
    const adminReply = String(replyMessage).trim();
    const inquiryMessage = String(originalMessage).trim();

    if (!recipient || !adminReply) {
      return res.status(400).json({ message: "Destinataire ou réponse manquants." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    const companyName = getEnv("MAIL_FROM_NAME") || "IR MIRINDI Business";
    const replyTo = getEnv("MAIL_REPLY_TO") || smtpEmail;
    const subject = `Réponse à votre demande - ${companyName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #18181b; max-width: 640px; margin: 0 auto;">
        <p>Bonjour${recipientName ? ` ${escapeHtml(recipientName)}` : ""},</p>
        <p>Merci pour votre message. Voici notre réponse :</p>
        <div style="margin: 24px 0; padding: 16px 20px; border-radius: 16px; background: #f4f4f5; border: 1px solid #e4e4e7;">
          ${formatMultilineHtml(adminReply)}
        </div>
        ${inquiryMessage ? `
          <p style="margin-top: 24px; font-size: 14px; color: #52525b;">Votre message initial :</p>
          <div style="padding: 16px 20px; border-radius: 16px; background: #fafafa; border: 1px solid #e4e4e7; font-size: 14px; color: #3f3f46;">
            ${formatMultilineHtml(inquiryMessage)}
          </div>
        ` : ""}
        <p style="margin-top: 24px;">Cordialement,<br />${escapeHtml(companyName)}</p>
      </div>
    `;

    const text = [
      `Bonjour${recipientName ? ` ${recipientName}` : ""},`,
      "",
      "Merci pour votre message. Voici notre réponse :",
      "",
      adminReply,
      inquiryMessage ? `\nVotre message initial :\n${inquiryMessage}` : "",
      "",
      `Cordialement,`,
      companyName,
    ]
      .filter(Boolean)
      .join("\n");

    await transporter.sendMail({
      from: `"${companyName}" <${smtpEmail}>`,
      to: recipient,
      replyTo,
      subject,
      text,
      html,
    });

    return res.status(200).json({ ok: true, sentBy: user.email });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue lors de l'envoi de l'email.";
    return res.status(500).json({ message });
  }
}
