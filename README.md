# CB Youngs

Magyar nyelvű, reszponzív one pager a CB Youngs plakátja alapján. Rust / Axum kiszolgáló, helyi WebP képek, külső frontend függőségek nélkül.

## Indítás

Rust stable szükséges. Ebben a cloud környezetben:

```sh
export CARGO_HOME=/workspace/.cargo
export RUSTUP_HOME=/workspace/.rustup
export PATH="$CARGO_HOME/bin:$PATH"
cd /workspace/cbyoungs
cargo run --locked
```

Alapértelmezett port: `3000`, a `PORT` környezeti változóval módosítható. A szerver a `0.0.0.0` címen figyel.

## Ellenőrzés

```sh
cargo fmt --check
cargo check --locked
curl --fail http://127.0.0.1:3000/health
```

Tartalom: `static/index.html`; megjelenés: `static/style.css`; kiszolgáló: `src/main.rs`. A jelentkezés a plakáton megadott e-mail-címre mutató `mailto:` hivatkozással működik. A képek a megadott PDF-ből származnak.

## Cloudflare Pages

A publikus webhely tervezett neve **cbyoungs.com**. A domain regisztrációja és a Cloudflare-fiókhoz kapcsolása külön lépés; a repó átnevezése nem regisztrál domaint.

A Pages a statikus HTML/CSS/képeket szolgálja ki. A Rust/Axum szerver helyi fejlesztéshez megmarad, a Pages környezetben nem fut Rust szerverfolyamat. A jelenlegi oldal minden funkciója működik statikus kiszolgálással.

GitHub-integráció Cloudflare-ben: **Workers & Pages → Create application → Pages → Connect to Git**. Válaszd a `janarepas/cbyoungs.com` repót (az átnevezés után), és állítsd be:

- Project name: `cbyoungs-com` (ha szabad)
- Production branch: `main`
- Framework preset: `None`
- Build command: `bash scripts/build-cloudflare.sh`
- Build output directory: `dist`
- Root directory: a repó gyökere
- Környezeti változó és secret nem szükséges az oldal működéséhez.

A GitHub-integrációt a Cloudflare-fiókban kell engedélyezni. Az első sikeres deploy után a Cloudflare jelzi a tényleges `pages.dev` címet. A további `main` pushok automatikusan új buildet indítanak.

Helyi build:

```sh
bash scripts/build-cloudflare.sh
```

A domain megvásárlása után a Pages projekt **Custom domains → Set up a custom domain** pontján add hozzá a `cbyoungs.com` domaint, és kövesd a Cloudflare által megadott DNS-beállításokat. A `www.cbyoungs.com` külön is hozzáadható. A domain elérhetősége még nincs ellenőrizve.
