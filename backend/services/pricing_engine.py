import math
from decimal import Decimal, ROUND_HALF_UP


MONEY = Decimal("100")

MATERIALS = {
    "banners": {
        "banner_13oz": (Decimal("0.85"), Decimal("8.00")),
        "banner_18oz": (Decimal("1.25"), Decimal("10.00")),
        "banner_mesh": (Decimal("1.40"), Decimal("11.00")),
        "banner_blockout": (Decimal("1.65"), Decimal("12.00")),
        "banner_fabric": (Decimal("2.75"), Decimal("16.00")),
        "banner_custom": (Decimal("2.00"), Decimal("12.00")),
    },
    "rigid_signs": {
        "coroplast_4mm": (Decimal("0.90"), Decimal("10.00")),
        "pvc_3mm": (Decimal("2.25"), Decimal("16.00")),
        "acm_dibond_3mm": (Decimal("4.25"), Decimal("24.00")),
        "aluminum_040": (Decimal("3.25"), Decimal("18.00")),
        "acrylic_1_8": (Decimal("4.50"), Decimal("24.00")),
        "custom_other_substrate": (Decimal("4.00"), Decimal("20.00")),
    },
    "cut_vinyl": {
        "oracal_651": (Decimal("1.25"), Decimal("12.00")),
        "oracal_751": (Decimal("2.50"), Decimal("15.00")),
        "reflective_vinyl": (Decimal("4.50"), Decimal("22.00")),
        "wall_vinyl": (Decimal("2.50"), Decimal("15.00")),
        "specialty_custom_vinyl": (Decimal("4.50"), Decimal("24.00")),
    },
    "digital_print": {
        "printable_adhesive_vinyl": (Decimal("1.50"), Decimal("10.00")),
        "poster_paper": (Decimal("0.60"), Decimal("6.00")),
        "canvas": (Decimal("2.25"), Decimal("15.00")),
        "backlit_film": (Decimal("2.50"), Decimal("16.00")),
        "wall_graphic_media": (Decimal("2.25"), Decimal("14.00")),
        "specialty_print_media": (Decimal("2.00"), Decimal("12.00")),
    },
    "vehicle_wrap": {
        "wrap_standard_calendared": (Decimal("1.50"), Decimal("9.00")),
        "wrap_premium_cast": (Decimal("2.75"), Decimal("14.00")),
        "wrap_cast_film": (Decimal("3.50"), Decimal("18.00")),
        "wrap_reflective": (Decimal("5.00"), Decimal("24.00")),
        "wrap_specialty_media": (Decimal("4.00"), Decimal("20.00")),
    },
}

DEFAULTS = {
    "production_rate": Decimal("28.00"),
    "design_rate": Decimal("85.00"),
    "install_rate": Decimal("95.00"),
    "overhead_percent": Decimal("15"),
}


def calculate_item_price(category: str, quantity: int, specs: dict) -> dict:
    quantity = max(int(quantity or 1), 1)
    if category == "banners":
        return _area_price(category, quantity, specs, "banner_material_key", Decimal("4.0"), Decimal("1.08"), Decimal("2.35"), Decimal("35.00"), Decimal("0.10"))
    if category == "rigid_signs":
        return _area_price(category, quantity, specs, "substrate_type_key", Decimal("1.0"), Decimal("1.05"), Decimal("2.45"), Decimal("25.00"), Decimal("0.15"))
    if category == "cut_vinyl":
        return _area_price(category, quantity, specs, "vinyl_type_key", Decimal("0.5"), Decimal("1.10"), Decimal("2.30"), Decimal("20.00"), Decimal("0.20"))
    if category == "digital_print":
        return _area_price(category, quantity, specs, "print_media_key", Decimal("1.0"), Decimal("1.10"), Decimal("2.30"), Decimal("20.00"), Decimal("0.08"))
    if category == "vehicle_wrap":
        return _wrap_price(quantity, specs)
    if category == "services":
        return _services_price(quantity, specs)
    if category == "apparel":
        return _apparel_price(specs)
    if category == "promo_misc":
        unit_cost = Decimal(str(specs.get("unit_cost_minor", 0))) / MONEY
        markup = Decimal(str(specs.get("markup_multiplier", "2.5")))
        return _result(unit_cost * Decimal(quantity) * markup, material=unit_cost * Decimal(quantity), labor=Decimal("0"), details={"method": "promo_misc_cost_plus"})
    unit_price = Decimal(str(specs.get("unit_price_minor", 0))) / MONEY
    return _result(unit_price * Decimal(quantity), details={"method": "manual_custom"})


def _area_price(category, quantity, specs, material_key, min_area, waste_mult, markup, minimum, labor_per_sqft):
    area = _area(specs)
    billable_area = max(area, min_area)
    total_area = billable_area * Decimal(quantity)
    waste_area = total_area * waste_mult
    material_cost, sell_rate = MATERIALS[category].get(specs.get(material_key), next(iter(MATERIALS[category].values())))
    material = waste_area * material_cost
    production_hours = max(total_area * labor_per_sqft, Decimal("0.2"))
    design_hours = Decimal("0.5") * _complexity(specs.get("design_complexity", "simple")) if specs.get("artwork_needed") else Decimal("0")
    install_hours = total_area * Decimal("0.08") if specs.get("install_required") else Decimal("0")
    labor = production_hours * DEFAULTS["production_rate"] + design_hours * DEFAULTS["design_rate"] + install_hours * DEFAULTS["install_rate"]
    overhead = (material + labor) * DEFAULTS["overhead_percent"] / Decimal("100")
    total_cost = material + labor + overhead
    selling = max(total_cost * markup, waste_area * sell_rate, minimum)
    selling = selling * (Decimal("1") - _quantity_discount(category, quantity))
    return _result(selling, material, labor, {
        "method": "max_of_rate_or_minimum",
        "area_sqft": float(area),
        "waste_area_sqft": float(waste_area),
        "production_hours": float(production_hours),
        "design_hours": float(design_hours),
        "install_hours": float(install_hours),
    })


def _wrap_price(quantity, specs):
    base_sqft = {
        "sedan": 150, "suv": 200, "pickup": 175, "cargo_van": 250,
        "sprinter_van": 350, "box_truck_16": 500, "trailer": 450, "semi": 800,
    }.get(specs.get("vehicle_type"), 160)
    coverage = {"spot": Decimal("0.15"), "partial": Decimal("0.40"), "half": Decimal("0.55"), "full": Decimal("1.0")}.get(specs.get("coverage_type"), Decimal(str(specs.get("custom_coverage_percent", 40))) / Decimal("100"))
    wrap_sqft = Decimal(base_sqft) * coverage
    waste = wrap_sqft * Decimal("1.12")
    material_cost, sell_rate = MATERIALS["vehicle_wrap"].get(specs.get("wrap_material_key"), MATERIALS["vehicle_wrap"]["wrap_premium_cast"])
    material = waste * material_cost
    production_hours = max(wrap_sqft * Decimal("0.12"), Decimal("1.0"))
    design_hours = Decimal("1.5") * _complexity(specs.get("design_complexity", "medium")) if specs.get("artwork_needed", True) else Decimal("0")
    install_hours = Decimal("5.0") * _complexity(specs.get("install_difficulty_level", "medium")) if specs.get("install_required", True) else Decimal("0")
    labor = production_hours * DEFAULTS["production_rate"] + design_hours * DEFAULTS["design_rate"] + install_hours * Decimal("75")
    overhead = (material + labor) * Decimal("0.15")
    cost_plus = (material + labor + overhead) * Decimal("2.4")
    package = Decimal("650") if specs.get("coverage_type") in {"spot", "partial"} else Decimal("2400")
    selling = max(cost_plus, package, Decimal("150"))
    return _result(selling * Decimal(quantity), material, labor, {"method": "max_of_package_or_cost_plus", "wrap_sqft": float(wrap_sqft)})


def _services_price(quantity, specs):
    hours = Decimal(str(specs.get("estimated_hours", 1))) * Decimal(str(specs.get("num_workers", 1)))
    rate = Decimal(str(specs.get("hourly_rate_override_minor") or 9500)) / MONEY
    total = max(hours * rate, Decimal(str(specs.get("services_minimum_override", 6000))) / MONEY)
    return _result(total * Decimal(quantity), labor=hours * rate, details={"method": "services_labor"})


def _apparel_price(specs):
    qty = sum(int(specs.get(f"size_{size}", 0) or 0) for size in ["xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl", "5xl"]) or int(specs.get("quantity", 1))
    blank = Decimal("7.00") * Decimal(qty) if not specs.get("customer_supplied") else Decimal("0")
    decoration = Decimal("5.00") * Decimal(qty) + Decimal("10.00")
    selling = max((blank + decoration) * Decimal("2.15"), Decimal("60.00"))
    return _result(selling, blank, decoration, {"method": "apparel_basic"})


def _area(specs):
    width = Decimal(str(specs.get("width", 0) or 0))
    height = Decimal(str(specs.get("height", 0) or 0))
    if specs.get("unit_of_measure", "inches") == "feet":
        return width * height
    return (width * height) / Decimal("144")


def _complexity(value):
    return {"simple": Decimal("1.0"), "medium": Decimal("1.25"), "complex": Decimal("1.5"), "extreme": Decimal("2.0"), "difficult": Decimal("1.5"), "high_risk": Decimal("2.0")}.get(str(value), Decimal("1.0"))


def _quantity_discount(category, quantity):
    if category == "banners":
        return Decimal("0.15") if quantity >= 25 else Decimal("0.10") if quantity >= 10 else Decimal("0.05") if quantity >= 3 else Decimal("0")
    return Decimal("0.15") if quantity >= 100 else Decimal("0.10") if quantity >= 25 else Decimal("0.05") if quantity >= 5 else Decimal("0")


def _minor(value: Decimal) -> int:
    return int((value * MONEY).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def _result(selling, material=Decimal("0"), labor=Decimal("0"), details=None):
    return {
        "selling_price_minor": _minor(selling),
        "material_cost_minor": _minor(material),
        "labor_cost_minor": _minor(labor),
        "details": details or {},
    }
