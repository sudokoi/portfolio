# Published content

Owns schema validation, asset references, snapshot selectors, and article text extraction. Public routes import the curated server-only `index.ts`. Build scripts/tests may import the pure schema/text modules directly; they never import the server-only repository.

`generated.ts` is ignored and regenerated from the validated manifest. It contains explicit static JSON imports so Next traces exactly the deployment snapshot. No public read queries Sanity.
