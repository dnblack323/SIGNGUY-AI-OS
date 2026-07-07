// Category wizard configs. Banners is fully fleshed out; others use short scaffolds.
export const WIZARD_CONFIGS = {
  banners: {
    defaultMethod: "per_sqft",
    methodOptions: ["per_sqft", "cost_plus_labor", "common_job_prices"],
    questions: [
      { id: "price_2x4", type: "money", label: "What would you charge for a 2ft x 4ft (8 sqft) 13oz banner w/ hems + grommets?" },
      { id: "price_3x6", type: "money", label: "What about a 3ft x 6ft (18 sqft)?" },
      { id: "price_4x8", type: "money", label: "And a 4ft x 8ft (32 sqft)?" },
      { id: "hems_grommets_included", type: "bool", label: "Are hems and grommets normally included in the price?" },
      { id: "minimum_charge", type: "money", label: "What is your minimum banner charge?" },
      { id: "pole_pocket_charge_per_ft", type: "money", label: "Pole pockets — charge per linear foot? (leave blank if not offered)" },
      { id: "reinforced_corners_charge", type: "money", label: "Reinforced corners — flat upcharge?" },
      { id: "wind_slit_charge", type: "money", label: "Wind slits — flat upcharge?" },
      { id: "install_available", type: "bool", label: "Do you offer banner installation?" },
    ],
  },
  rigid_signs: {
    defaultMethod: "per_sqft",
    methodOptions: ["per_sqft", "cost_plus_labor", "common_job_prices"],
    questions: [
      { id: "minimum_charge", type: "money", label: "Minimum rigid sign charge?" },
      { id: "base_sell_rate_per_sqft", type: "money", label: "Typical sell rate per sqft for coroplast/PVC signs?" },
    ],
  },
  cut_vinyl: {
    defaultMethod: "per_sqft",
    methodOptions: ["per_sqft", "cost_plus_labor", "common_job_prices"],
    questions: [
      { id: "minimum_charge", type: "money", label: "Minimum decal charge?" },
      { id: "base_sell_rate_per_sqft", type: "money", label: "Typical sell rate per sqft?" },
    ],
  },
  digital_print: {
    defaultMethod: "per_sqft",
    methodOptions: ["per_sqft", "cost_plus_labor"],
    questions: [
      { id: "minimum_charge", type: "money", label: "Minimum digital print charge?" },
      { id: "base_sell_rate_per_sqft", type: "money", label: "Typical sell rate per sqft?" },
    ],
  },
  vehicle_graphics: {
    defaultMethod: "cost_plus_labor",
    methodOptions: ["cost_plus_labor", "common_job_prices"],
    questions: [
      { id: "printed_wrap_sell_per_sqft", type: "money", label: "Printed wrap sell rate per sqft?" },
      { id: "color_change_wrap_sell_per_sqft", type: "money", label: "Color-change wrap sell rate per sqft?" },
      { id: "minimum_charge", type: "money", label: "Minimum vehicle graphics charge?" },
    ],
  },
  apparel: {
    defaultMethod: "cost_plus_labor",
    methodOptions: ["cost_plus_labor", "common_job_prices"],
    questions: [
      { id: "blank_tshirt_cost", type: "money", label: "Typical blank T-shirt cost?" },
      { id: "decoration_cost_per_garment", type: "money", label: "Decoration cost per garment (HTV or transfer)?" },
      { id: "minimum_charge", type: "money", label: "Minimum apparel order charge?" },
    ],
  },
  services: {
    defaultMethod: "cost_plus_labor",
    methodOptions: ["cost_plus_labor", "common_job_prices"],
    questions: [
      { id: "minimum_design_charge", type: "money", label: "Minimum design charge?" },
      { id: "minimum_install_charge", type: "money", label: "Minimum install charge?" },
    ],
  },
  promotional: {
    defaultMethod: "cost_plus_labor",
    methodOptions: ["cost_plus_labor"],
    questions: [
      { id: "default_markup_multiplier", type: "number", step: "0.05", label: "Vendor markup multiplier (e.g. 1.5 for 50% markup)?" },
      { id: "minimum_setup_fee", type: "money", label: "Minimum setup fee?" },
      { id: "minimum_charge", type: "money", label: "Minimum order?" },
    ],
  },
  custom: {
    defaultMethod: "cost_plus_labor",
    methodOptions: ["cost_plus_labor", "common_job_prices"],
    questions: [
      { id: "default_markup_multiplier", type: "number", step: "0.05", label: "Default markup multiplier?" },
      { id: "minimum_charge", type: "money", label: "Minimum custom order?" },
      { id: "labor_hours_per_unit_default", type: "number", step: "0.05", label: "Typical labor hours per unit?" },
    ],
  },
};
