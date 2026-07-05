PHYSICAL_PRODUCTION_CATEGORIES = frozenset({
    "rigid_signs",
    "banners",
    "cut_vinyl",
    "digital_print",
    "vehicle_wrap",
    "apparel",
    "promo_misc",
    "custom",
})


def default_production_required(item_category: str = "") -> bool:
    return item_category in PHYSICAL_PRODUCTION_CATEGORIES
