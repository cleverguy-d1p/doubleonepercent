# Double One Percent

Next.js member onboarding connected to Supabase project zexwsyzkqkzxxheyxvlr.

## Local development

Run `npm ci`, copy `.env.example` to `.env.local`, enter the project publishable key, and run `npm run dev`. Only publishable values use NEXT_PUBLIC_. Never add a privileged Supabase key to browser code.

Routes: `/` landing page, `/onboarding` member sign-in and intake, `/coach` authorized coach review, `/privacy` draft privacy notice.

## Database

The migration in `supabase/migrations/202609130001_onboarding.sql` was applied to D1P Fitness on September 13, 2026. Do not run it again against that project. Row-level security protects intakes and private baseline photos; writes go through authenticated database functions. `coaches` has no member write permissions. An administrator must authorize coach accounts after they sign in.

A rollback-only test in the Supabase SQL editor verified member isolation, no member coach elevation, direct-write denial, unknown-answer rejection, conditional-answer cleanup, idempotent submission, and post-submission write protection. No test accounts were retained. Browser member sign-in, upload and cross-device resume still need end-to-end testing.

## Questionnaire

`questionnaire-source.json` preserves the source document revision. `src/lib/questions.json` defines all 14 sections. Field IDs map to source paragraph positions; retain IDs when editing labels. Conditional rules currently cover macro targets, cycling applicability and optional photos. The database applies the same conditional cleanup.

## Before member launch

- Configure production SMTP and verify sign-in email delivery. The default Supabase sender restricts recipients.
- Set the Supabase Site URL and allowed redirect URLs for the preview and final domain.
- Configure Vercel environment variables from `.env.example`.
- Confirm the coach account and grant it access through a trusted administrative action.
- Finalize the privacy notice, support contact and retention policy with the owner.
- Configure confirmation/coach notification email delivery (not implemented yet).
- Complete browser tests for login, resuming, file uploads, submission, and coach review.
- Connect doubleonepercent.com and www only after preview acceptance; verify HTTPS.

## Validation

`npm run build` performs production compilation and TypeScript checking. `npm run lint` runs ESLint.
