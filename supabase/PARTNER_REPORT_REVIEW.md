# Partner safety report review process

This process is for the person or small team responsible for reviewing partner safety reports. The inbox is private to Firebase sign-in emails allowlisted by the Supabase Edge Function secret `PARTNER_REPORT_ADMIN_EMAILS`.

## Set up the reviewer

1. In the Supabase dashboard, open project `odndoykzrjmvonsyhvtx`.
2. Open **Edge Functions** → **Secrets**.
3. Set `PARTNER_REPORT_ADMIN_EMAILS` to the Firebase sign-in email for each reviewer. Separate multiple email addresses with commas.
4. Deploy the current `partner-matching` Edge Function so it can check the secret.
5. Sign in to Re.Claim using an allowlisted account, open **Partner**, and confirm the **Safety report review** card appears. Open the inbox and confirm the reports load.

Never put reviewer credentials or service keys in the app or this file.

## Review reports each business day

1. Open **Partner** → **Safety report review** → **Open report inbox**. Press **Refresh queue** when checking for new submissions.
2. Start with reports labeled **User feels unsafe — review first**. The inbox places those first, then other new reports oldest-first. Reports already in progress and completed reports follow.
3. Set a new report to **In review** and save it before investigating. Read only what is needed to assess the report. Treat the report details as sensitive.
4. If a reporter's email is available, use **Email reporter** to acknowledge the report or request relevant information. Do not promise a response time or outcome that the team cannot meet.
5. When the review is complete, set **Action taken** if the team took an action, or **Closed** if no further review is needed. The inbox records the status and reviewer update; it does not provide a private investigation-notes field. Keep any necessary case notes only in an approved, access-controlled system.

If no reviewer can check the inbox each business day, pause partner matching until coverage is restored. The app does not notify reviewers when a report arrives, and the inbox displays only the latest 100 reports.

## Immediate safety

Re.Claim's report inbox is manually reviewed and is not monitored continuously. It is not an emergency service. If someone is in immediate danger, they should use local emergency services or the app's SOS resources. A report by itself does not block the other person; the reporter can use **Block** to end contact. A **Report and block** submission also blocks that partner.

## What this process supports

The app stores reports privately in Firestore and lets allowlisted reviewers view them and update their status. It does not automatically investigate reports, notify a reviewer, suspend an account across the app, or guarantee a response time. Keep the in-app wording and any public safety promises aligned with these limits.
