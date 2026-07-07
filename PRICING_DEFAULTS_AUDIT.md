# Pricing Defaults Audit

This document records the source of every value seeded into the SignGuy AI starter default pack.
When a tenant is first initialized, a **deep copy** of this pack is cloned into their `pricing_settings` document. Editing the seed here does **not** retroactively affect existing tenants.

**Precedence rules used to pick values:**
1. Any value explicitly named in the SignGuy AI MVP problem statement ("MVP baseline anchors") wins.
2. Otherwise, use the tested default from the original Pricing Foundation (documented via `PRICING_FOUNDATION_ORIGINAL_REPO_DEFAULT_VALUES.md`).
3. If neither source has a trustworthy value, the field is flagged with `needs_tenant_setup: true` rather than inventing a fake default.

**Money storage:** the seed uses float dollars for readability. The calculator converts to `Decimal` internally to avoid float drift. Tenant-persisted monetary values follow the same convention (dollars, not cents) inside `pricing_settings` — because pricing math needs sub-cent precision (per-sqft rates, hourly rates). Invoice totals continue to be stored as integer cents elsewhere in the app.

## Shop Defaults

| Field | Value | Source |
|---|---:|---|
| design_hourly_rate | $97.00 | MVP baseline anchor |
| production_hourly_rate | $28.00 | MVP baseline anchor (matches original) |
| install_hourly_rate | $75.00 | MVP baseline anchor |
| default_overhead_percent | 19% | MVP baseline anchor |
| target_profit_margin_percent | 40% | MVP baseline anchor (matches original) |
| minimum_order_amount | $25.00 | MVP baseline anchor |
| deposit_percentage | 50% | MVP baseline anchor (matches original) |
| default_markup_multiplier | 2.5× | Original repo |
| default_waste_percent | 10% | Original repo |
| rush_fee_percent | 25% | Original repo |

## Materials

Opinionated subset of the original repo's tested material list. Cost and sell rates come from the original Pricing Foundation.

Covered:
- Banners: 13 oz, 18 oz, mesh, blockout
- Rigid Signs: coroplast 4mm/10mm, PVC 3mm, ACM 3mm, aluminum .040, foamboard
- Cut Vinyl: Oracal 651/751, reflective
- Digital Print: adhesive vinyl, poster paper, wall media, floor media
- Vehicle Graphics: calendered, cast, window perf

Deferred (needs tenant setup): laminates, apparel blanks catalog, hardware, equipment.

## Category Defaults

All category records share this shape and are seeded from the original repo unless the MVP baseline states otherwise:

| Field | Notes |
|---|---|
| pricing_method | `per_sqft`, `cost_plus_labor`, or `common_job_prices` |
| minimum_charge | Category floor before overrides |
| base_sell_rate_per_sqft | Only set when area-based makes sense |
| default_markup_multiplier | Fallback multiplier |
| target_margin_percent | Preferred profit margin |
| waste_percent | Applied to material cost before markup |
| default_material | Material key for material catalog |
| common_job_prices | Populated by wizard answers |
| quantity_tiers | Optional discount ladder |
| setup_complete | Flipped by wizard "Apply" |
| needs_tenant_setup | Flag when values are uncertain |

### Per-category values used

| Category | Method | Base rate ($/sqft) | Min charge | Markup | Target margin | Waste % | Default material |
|---|---|---:|---:|---:|---:|---:|---|
| banners | per_sqft | 8.00 | 35 | 2.35 | 40% | 8% | banner_13oz |
| rigid_signs | per_sqft | 10.00 | 25 | 2.45 | 41% | 5% | coroplast_4mm |
| cut_vinyl | per_sqft | 12.00 | 25 | 2.30 | 40% | 10% | oracal_651 |
| digital_print | per_sqft | 9.50 | 40 | 2.30 | 40% | 10% | print_adhesive_vinyl |
| vehicle_graphics | cost_plus_labor | — | 150 | 2.40 | 42% | 12% | wrap_calendered |
| apparel | per_sqft | — | 60 | 2.15 | 38% | — | — |
| services | cost_plus_labor | — | 25 | 1.80 | 35% | — | — |
| promotional | cost_plus_labor | — | 50 | 1.50 | 33% | — | flagged `needs_tenant_setup` |
| custom | cost_plus_labor | — | 50 | 2.25 | 38% | — | — |

### SignGuy AI product anchors (seeded into category extras)

- Coroplast 4x4 default sell price: $47.00
- Coroplast 4x8 default sell price: $75.00
- Yard sign large-qty each price: $8.50
- Printed vehicle wrap default sell rate: $19.00/sqft
- Color-change wrap default sell rate: $17.00/sqft
- Apparel blank T-shirt cost: $3.25
- Apparel decoration cost per garment: $0.50
- Apparel production minutes per garment: 2 min

## Deferred (not in MVP seed)

These exist in the original repo but are intentionally NOT seeded to keep the MVP focused. They can be layered in later once wizards or admin UI cover them:

- Full labor rate rules table (helper add-ons, weekend/holiday multipliers)
- Full hardware catalog with per-item labor minutes
- Full equipment rental catalog (day + hour)
- Full apparel blanks catalog (Gildan/Bella)
- Detailed digital-print quality/contour multipliers
- Selling price benchmarks (analytics feature)
- AI/benchmark rule flags (out of scope for MVP)

## Update policy

- Bumping `starter_default_version` in `starter_defaults.py` does **not** re-seed existing tenants. If a future migration needs to fill in a new field for existing tenants, write an explicit backfill script.
- Tenants can restore starter defaults for a single category via the `/api/pricing/settings/categories/{category_id}/reset` endpoint.
