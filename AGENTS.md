<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Static restaurant contact, hours, socials, gallery and bundled demo images live in src/data/site.ts; contact buttons remain disabled until verified values are set.
- Live meals and prices are stored in Cloud meals with public published-only reads and admin-only writes; both home and menu use the same query so owner changes stay consistent.
- Owner privileges live in protected user_roles and must be granted by a trusted operator to a designated account; signup never grants admin access.
- A service-only owner invitation grants the admin role only after the designated email is confirmed and is consumed once; changing the account email preserves its role for handover.
- Private meal photos use signed viewing links, and storage write policies require the admin role because public buckets are blocked by workspace policy.
