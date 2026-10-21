# Partner report review setup

The report inbox is available to a Re.Claim account only when its Firebase sign-in email is included in the Supabase Edge Function secret `PARTNER_REPORT_ADMIN_EMAILS`. The server checks this list for every report-list and status-update request; the app does not decide access on its own.

## Enable the inbox

1. In the Supabase dashboard, open project `odndoykzrjmvonsyhvtx`.
2. Open **Edge Functions** and select **Secrets**.
3. Add `PARTNER_REPORT_ADMIN_EMAILS` with the email address used to sign in to Re.Claim as an administrator. For more than one administrator, separate the email addresses with commas.
4. Deploy the updated `partner-matching` Edge Function.
5. Sign in to the app with an allowlisted account and open **Partner**. The **Safety report review** card will appear there.

Do not put administrator credentials in the app or in this file. The inbox shows up to 100 most recent reports and allows an administrator to mark each report **New**, **In review**, **Action taken**, or **Closed**. Reports remain private in Firestore; normal app users cannot read or change them directly.

Reports are reviewed manually and are not monitored in real time. The inbox does not send an alert when a report arrives.
