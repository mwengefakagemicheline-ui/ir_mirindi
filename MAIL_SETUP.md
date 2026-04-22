## Envoi Gmail depuis l'admin

Le bouton `Envoyer la réponse` utilise maintenant l'endpoint serveur `api/send-inquiry-reply.js`.

### Variables à ajouter sur Vercel

Ajoutez ces variables dans `Project Settings > Environment Variables` :

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ADMIN_EMAILS`
- `GMAIL_SMTP_EMAIL`
- `GMAIL_SMTP_APP_PASSWORD`
- `MAIL_FROM_NAME`
- `MAIL_REPLY_TO`

### Valeurs attendues

- `SUPABASE_URL` : votre URL Supabase
- `SUPABASE_ANON_KEY` : votre clé anon Supabase
- `ADMIN_EMAILS` : liste d'emails admin séparés par des virgules
- `GMAIL_SMTP_EMAIL` : votre adresse Gmail d'envoi
- `GMAIL_SMTP_APP_PASSWORD` : mot de passe d'application Gmail
- `MAIL_FROM_NAME` : nom affiché dans l'email, par exemple `IR MIRINDI Business`
- `MAIL_REPLY_TO` : adresse de réponse, souvent la même que `GMAIL_SMTP_EMAIL`

### Gmail

Pour `GMAIL_SMTP_APP_PASSWORD` :

1. Activez la validation en 2 étapes sur le compte Gmail.
2. Ouvrez Google > Sécurité > Mots de passe des applications.
3. Générez un mot de passe d'application.
4. Collez cette valeur dans `GMAIL_SMTP_APP_PASSWORD`.

### En local

Si vous testez localement, ajoutez aussi ces variables dans votre environnement local avant de lancer le projet.
