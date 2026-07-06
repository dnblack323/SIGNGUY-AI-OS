{
  "meta": {
    "product_name": "SignGuy AI",
    "app_type": "multi-tenant B2B SaaS operations dashboard",
    "design_personality": [
      "calm + high-clarity",
      "dense-when-needed (tables), breathable elsewhere",
      "trustworthy + utilitarian",
      "Notion/Stripe-like restraint (no marketing gloss)"
    ],
    "north_star": "Speed + low cognitive load for daily shop operations",
    "implementation_note": "Repo uses React (.js), Tailwind, shadcn/ui (jsx). Guidelines below reference .jsx components and patterns (no .tsx).",
    "testing_requirement": "All interactive and key informational elements MUST include data-testid (kebab-case, role-based)."
  },

  "brand_attributes": {
    "tone": "Professional, practical, quietly premium",
    "visual_metaphor": "Paper + precision tools: clean surfaces, crisp borders, subtle depth",
    "do_not": [
      "No purple-forward brand accents (except status mapping where required)",
      "No decorative charts",
      "No heavy gradients; keep gradients under 20% viewport and only as section background accents",
      "No centered app container"
    ]
  },

  "design_tokens": {
    "color": {
      "mode": "light",
      "css_custom_properties": {
        "note": "These extend/override the existing shadcn tokens in src/index.css. Keep HSL format for shadcn compatibility.",
        "root": {
          "--background": "210 20% 99%",
          "--foreground": "222 22% 12%",

          "--card": "0 0% 100%",
          "--card-foreground": "222 22% 12%",

          "--popover": "0 0% 100%",
          "--popover-foreground": "222 22% 12%",

          "--primary": "222 47% 11%",
          "--primary-foreground": "210 40% 98%",

          "--secondary": "210 24% 96%",
          "--secondary-foreground": "222 22% 12%",

          "--muted": "210 24% 96%",
          "--muted-foreground": "215 16% 42%",

          "--accent": "188 52% 92%",
          "--accent-foreground": "222 47% 11%",

          "--destructive": "0 72% 52%",
          "--destructive-foreground": "210 40% 98%",

          "--border": "214 20% 90%",
          "--input": "214 20% 90%",
          "--ring": "188 62% 34%",

          "--radius": "0.625rem",

          "--sidebar": "210 24% 98%",
          "--sidebar-foreground": "222 22% 12%",
          "--sidebar-muted": "210 18% 94%",
          "--sidebar-border": "214 20% 90%",

          "--focus": "188 62% 34%",

          "--shadow-color": "222 22% 12%",

          "--status-draft": "215 16% 46%",
          "--status-sent": "205 78% 44%",
          "--status-approved": "152 55% 36%",
          "--status-declined": "0 72% 52%",
          "--status-converted": "270 55% 46%",

          "--status-not-started": "215 16% 46%",
          "--status-in-progress": "38 92% 45%",
          "--status-on-hold": "24 92% 45%",
          "--status-completed": "152 55% 36%",

          "--status-viewed": "231 72% 52%",
          "--status-partially-paid": "38 92% 45%",
          "--status-paid": "152 55% 36%",
          "--status-overdue": "0 72% 52%",
          "--status-void": "215 18% 34%"
        },
        "optional_dark_mode_scaffold": {
          "note": "No dark mode required for MVP. Keep this structure so adding .dark later is straightforward.",
          "--background": "222 22% 10%",
          "--foreground": "210 40% 98%",
          "--card": "222 22% 12%",
          "--border": "215 18% 22%",
          "--muted": "215 18% 18%",
          "--muted-foreground": "215 16% 70%",
          "--ring": "188 62% 44%"
        }
      },
      "semantic_palette": {
        "canvas": {
          "app_background": "hsl(var(--background))",
          "surface": "hsl(var(--card))",
          "surface_subtle": "hsl(var(--secondary))",
          "divider": "hsl(var(--border))"
        },
        "text": {
          "primary": "hsl(var(--foreground))",
          "secondary": "hsl(var(--muted-foreground))",
          "inverse": "hsl(var(--primary-foreground))"
        },
        "brand_accent": {
          "accent_soft": "hsl(var(--accent))",
          "accent_ring": "hsl(var(--ring))",
          "accent_solid": "hsl(188 62% 34%)"
        }
      },
      "gradient_policy": {
        "allowed": [
          "Only as a subtle section background wash (hero/header strip) under 20% viewport",
          "Only 2–3 light stops, low saturation"
        ],
        "recommended_gradients": [
          {
            "name": "header-wash",
            "css": "radial-gradient(1200px 400px at 20% 0%, hsl(188 52% 92%) 0%, transparent 60%), radial-gradient(900px 360px at 80% 10%, hsl(210 24% 96%) 0%, transparent 55%)"
          }
        ],
        "prohibited": [
          "blue-500 to purple-600",
          "purple-500 to pink-500",
          "green-500 to blue-500",
          "red to pink",
          "any dark/saturated gradient combos"
        ]
      }
    },

    "typography": {
      "font_pairing": {
        "display": {
          "family": "Space Grotesk",
          "fallback": "ui-sans-serif, system-ui",
          "usage": "Page titles, section headers, key numbers"
        },
        "body": {
          "family": "Inter",
          "fallback": "ui-sans-serif, system-ui",
          "usage": "All UI body text, tables, forms"
        },
        "mono": {
          "family": "IBM Plex Mono",
          "fallback": "ui-monospace, SFMono-Regular",
          "usage": "IDs, invoice numbers, audit metadata"
        }
      },
      "google_fonts_import": {
        "note": "Add to index.html or CSS import (implementation choice).",
        "url": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap"
      },
      "scale_tailwind": {
        "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
        "h2": "text-base md:text-lg font-medium text-muted-foreground",
        "section_title": "text-lg font-semibold",
        "body": "text-sm md:text-base",
        "table": "text-sm",
        "meta": "text-xs text-muted-foreground",
        "numbers": "tabular-nums"
      },
      "line_height": {
        "dense_ui": "leading-5",
        "reading": "leading-6"
      }
    },

    "spacing": {
      "system": "8px base",
      "tokens": {
        "--space-1": "0.25rem",
        "--space-2": "0.5rem",
        "--space-3": "0.75rem",
        "--space-4": "1rem",
        "--space-5": "1.25rem",
        "--space-6": "1.5rem",
        "--space-8": "2rem",
        "--space-10": "2.5rem",
        "--space-12": "3rem"
      },
      "page_padding": {
        "mobile": "px-4 py-4",
        "desktop": "px-6 py-6",
        "max_width": "max-w-[1400px]"
      },
      "density_rules": [
        "Tables: tighter vertical padding (py-2) but keep row height >= 40px",
        "Forms: group fields with gap-4; sections with gap-6",
        "Detail pages: main column gap-6; right rail gap-4"
      ]
    },

    "radius": {
      "global": "var(--radius)",
      "mapping": {
        "card": "rounded-xl",
        "button": "rounded-lg",
        "input": "rounded-lg",
        "pill": "rounded-full"
      }
    },

    "shadow": {
      "principles": [
        "Use subtle elevation only to separate layers (popover/dialog), not for every card",
        "Prefer borders + slight shadow"
      ],
      "tailwind_presets": {
        "card": "shadow-[0_1px_0_rgba(15,23,42,0.04)]",
        "popover": "shadow-[0_12px_32px_rgba(15,23,42,0.12)]",
        "focus_ring": "focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus))] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      }
    },

    "motion": {
      "duration": {
        "fast": "150ms",
        "base": "200ms",
        "slow": "280ms"
      },
      "easing": {
        "standard": "cubic-bezier(0.2, 0.8, 0.2, 1)",
        "out": "cubic-bezier(0.16, 1, 0.3, 1)"
      },
      "micro_interactions": [
        "Buttons: hover bg shift + 1px translateY(-1) via shadow change (no transform transitions globally)",
        "Table rows: hover highlight (bg-muted/40) + show row actions",
        "Sidebar: active item has left accent bar + subtle background",
        "Skeletons: use shadcn Skeleton with gentle pulse"
      ],
      "library": {
        "recommended": "framer-motion",
        "install": "npm i framer-motion",
        "usage": "Use for page transitions (opacity + y: 4) and modal entrance; respect prefers-reduced-motion"
      }
    }
  },

  "layout": {
    "grid": {
      "app_shell": {
        "desktop": "grid grid-cols-[260px_1fr]",
        "collapsed": "grid grid-cols-[72px_1fr]",
        "mobile": "Sidebar becomes Sheet (hamburger)"
      },
      "content": {
        "max_width": "max-w-[1400px]",
        "columns": "Dashboard uses 12-col grid on lg: grid-cols-12 gap-6",
        "detail_page": "lg:grid lg:grid-cols-[1fr_360px] gap-6"
      }
    },
    "sidebar_spec": {
      "width": {
        "expanded": "w-[260px]",
        "collapsed": "w-[72px]"
      },
      "structure": [
        "Top: tenant switcher (shop name) + collapse button",
        "Middle: nav items",
        "Bottom: help link + version + user quick switch (optional)"
      ],
      "nav_item_states": {
        "base": "h-10 px-3 rounded-lg flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60",
        "active": "text-foreground bg-muted/80 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-[hsl(var(--ring))]",
        "disabled": "opacity-50 pointer-events-none"
      }
    },
    "topbar_spec": {
      "height": "h-14",
      "layout": "flex items-center justify-between gap-3",
      "left": "Breadcrumbs (optional) + page title on small screens",
      "center": "Global search (Command component)",
      "right": "Email failure indicator + notifications-lite + user menu",
      "surface": "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
    }
  },

  "iconography": {
    "library": "lucide-react",
    "nav_icon_map": [
      { "route": "/", "label": "Home", "icon": "Home" },
      { "route": "/customers", "label": "Customers", "icon": "Users" },
      { "route": "/quotes", "label": "Quotes", "icon": "FileText" },
      { "route": "/orders", "label": "Orders", "icon": "ShoppingBag" },
      { "route": "/work-orders", "label": "Work Orders", "icon": "Wrench" },
      { "route": "/invoices", "label": "Invoices", "icon": "Receipt" },
      { "route": "/documents", "label": "Documents", "icon": "Folder" },
      { "route": "/email-history", "label": "Email History", "icon": "Mail" },
      { "route": "/settings", "label": "Settings", "icon": "Settings" }
    ],
    "icon_rules": [
      "Use size-4 (16px) in nav and buttons; size-5 (20px) for empty states",
      "Use text-muted-foreground by default; inherit currentColor"
    ]
  },

  "component_path": {
    "shadcn_primary": {
      "Button": "/app/frontend/src/components/ui/button.jsx",
      "Badge": "/app/frontend/src/components/ui/badge.jsx",
      "Card": "/app/frontend/src/components/ui/card.jsx",
      "Tabs": "/app/frontend/src/components/ui/tabs.jsx",
      "Table": "/app/frontend/src/components/ui/table.jsx",
      "Input": "/app/frontend/src/components/ui/input.jsx",
      "Textarea": "/app/frontend/src/components/ui/textarea.jsx",
      "Select": "/app/frontend/src/components/ui/select.jsx",
      "Dialog": "/app/frontend/src/components/ui/dialog.jsx",
      "Sheet": "/app/frontend/src/components/ui/sheet.jsx",
      "DropdownMenu": "/app/frontend/src/components/ui/dropdown-menu.jsx",
      "Command": "/app/frontend/src/components/ui/command.jsx",
      "Pagination": "/app/frontend/src/components/ui/pagination.jsx",
      "Skeleton": "/app/frontend/src/components/ui/skeleton.jsx",
      "ScrollArea": "/app/frontend/src/components/ui/scroll-area.jsx",
      "Separator": "/app/frontend/src/components/ui/separator.jsx",
      "Tooltip": "/app/frontend/src/components/ui/tooltip.jsx",
      "Sonner": "/app/frontend/src/components/ui/sonner.jsx"
    },
    "custom_components_to_create": {
      "AppShell": "src/components/app-shell/AppShell.jsx",
      "SidebarNav": "src/components/app-shell/SidebarNav.jsx",
      "Topbar": "src/components/app-shell/Topbar.jsx",
      "PermissionGate": "src/components/auth/PermissionGate.jsx",
      "PageHeader": "src/components/layout/PageHeader.jsx",
      "DetailHeader": "src/components/layout/DetailHeader.jsx",
      "StatCard": "src/components/dashboard/StatCard.jsx",
      "StatusPill": "src/components/common/StatusPill.jsx",
      "DataTable": "src/components/table/DataTable.jsx",
      "AuditTimeline": "src/components/audit/AuditTimeline.jsx",
      "EmptyState": "src/components/common/EmptyState.jsx",
      "LoadingSkeleton": "src/components/common/LoadingSkeleton.jsx",
      "ComposeEmailModal": "src/components/email/ComposeEmailModal.jsx",
      "AttachmentList": "src/components/documents/AttachmentList.jsx",
      "FileUploadDropzone": "src/components/documents/FileUploadDropzone.jsx",
      "MoneyInput": "src/components/forms/MoneyInput.jsx"
    }
  },

  "component_patterns": {
    "AppShell": {
      "goal": "Consistent navigation + fast scanning",
      "structure": {
        "desktop": "Sidebar fixed left; Topbar sticky; Content scrolls",
        "mobile": "Sidebar in Sheet; Topbar shows hamburger + search"
      },
      "tailwind_scaffold": {
        "root": "min-h-dvh bg-background text-foreground",
        "shell": "grid grid-cols-1 lg:grid-cols-[260px_1fr]",
        "sidebar": "hidden lg:flex flex-col border-r bg-[hsl(var(--sidebar))]",
        "main": "min-w-0",
        "topbar": "sticky top-0 z-30 border-b"
      },
      "data_testids": {
        "sidebar": "app-shell-sidebar",
        "topbar": "app-shell-topbar",
        "content": "app-shell-content"
      }
    },

    "PermissionGate": {
      "purpose": "Hide/disable nav items and actions based on backend permissions",
      "behavior": [
        "If no permission: do not render element (preferred for nav)",
        "If partial permission: render disabled button with tooltip explaining"
      ],
      "data_testids": {
        "wrapper": "permission-gate"
      }
    },

    "PageHeader": {
      "usage": "List pages",
      "layout": "Title + subtitle left; primary actions right; filters row below",
      "tailwind": {
        "wrap": "flex flex-col gap-4",
        "top": "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
        "title": "font-[family:var(--font-display)] text-2xl font-semibold tracking-tight",
        "subtitle": "text-sm text-muted-foreground",
        "actions": "flex items-center gap-2",
        "filters": "flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
      },
      "data_testids": {
        "title": "page-header-title",
        "primary_action": "page-header-primary-action"
      }
    },

    "DetailHeader": {
      "usage": "Detail pages",
      "layout": "Entity title + key metadata; primary actions; status pill",
      "tailwind": {
        "wrap": "flex flex-col gap-3",
        "row": "flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between",
        "meta": "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground",
        "actions": "flex items-center gap-2"
      },
      "data_testids": {
        "entity-title": "detail-header-entity-title",
        "primary-action": "detail-header-primary-action"
      }
    },

    "StatCard": {
      "usage": "Dashboard top row",
      "composition": "Card + label + value + helper text + optional link",
      "tailwind": {
        "card": "rounded-xl border bg-card p-4 shadow-[0_1px_0_rgba(15,23,42,0.04)]",
        "label": "text-xs font-medium text-muted-foreground",
        "value": "mt-2 text-2xl font-semibold tabular-nums",
        "helper": "mt-1 text-xs text-muted-foreground"
      },
      "data_testids": {
        "card": "dashboard-stat-card",
        "value": "dashboard-stat-card-value"
      }
    },

    "StatusPill": {
      "base": "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
      "rules": [
        "Always include text label (don’t rely on color alone)",
        "Optional leading dot icon (Circle) for quick scanning"
      ],
      "enum_to_color_mapping": {
        "quote_status": {
          "draft": { "bg": "bg-slate-100", "text": "text-slate-700", "ring": "ring-1 ring-slate-200" },
          "sent": { "bg": "bg-sky-100", "text": "text-sky-800", "ring": "ring-1 ring-sky-200" },
          "approved": { "bg": "bg-emerald-100", "text": "text-emerald-800", "ring": "ring-1 ring-emerald-200" },
          "declined": { "bg": "bg-rose-100", "text": "text-rose-800", "ring": "ring-1 ring-rose-200" },
          "converted": { "bg": "bg-violet-100", "text": "text-violet-800", "ring": "ring-1 ring-violet-200" }
        },
        "production_status": {
          "not_started": { "bg": "bg-slate-100", "text": "text-slate-700", "ring": "ring-1 ring-slate-200" },
          "in_progress": { "bg": "bg-amber-100", "text": "text-amber-900", "ring": "ring-1 ring-amber-200" },
          "on_hold": { "bg": "bg-orange-100", "text": "text-orange-900", "ring": "ring-1 ring-orange-200" },
          "completed": { "bg": "bg-emerald-100", "text": "text-emerald-800", "ring": "ring-1 ring-emerald-200" }
        },
        "invoice_status": {
          "draft": { "bg": "bg-slate-100", "text": "text-slate-700", "ring": "ring-1 ring-slate-200" },
          "sent": { "bg": "bg-sky-100", "text": "text-sky-800", "ring": "ring-1 ring-sky-200" },
          "viewed": { "bg": "bg-indigo-100", "text": "text-indigo-800", "ring": "ring-1 ring-indigo-200" },
          "partially_paid": { "bg": "bg-amber-100", "text": "text-amber-900", "ring": "ring-1 ring-amber-200" },
          "paid": { "bg": "bg-emerald-100", "text": "text-emerald-800", "ring": "ring-1 ring-emerald-200" },
          "overdue": { "bg": "bg-rose-100", "text": "text-rose-800", "ring": "ring-1 ring-rose-200" },
          "void": { "bg": "bg-slate-200", "text": "text-slate-800", "ring": "ring-1 ring-slate-300" }
        }
      },
      "data_testids": {
        "pill": "status-pill"
      }
    },

    "DataTable": {
      "goal": "Fast scanning, sortable, filterable, paginated",
      "use_shadcn": ["Table", "Button", "Input", "Select", "DropdownMenu", "Pagination", "Skeleton"],
      "table_rules": [
        "Header row sticky within ScrollArea for long lists",
        "Right-align money columns; use tabular-nums",
        "Row hover reveals quick actions (View, Edit, Email)",
        "Column headers are buttons for sorting (aria-sort)"
      ],
      "tailwind": {
        "wrap": "rounded-xl border bg-card",
        "toolbar": "flex flex-col gap-2 p-3 md:flex-row md:items-center md:justify-between",
        "table": "w-full text-sm",
        "th": "h-10 px-3 text-left align-middle font-medium text-muted-foreground",
        "td": "px-3 py-2 align-middle",
        "row": "hover:bg-muted/40",
        "money": "text-right tabular-nums"
      },
      "states": {
        "loading": "Show 8–10 Skeleton rows",
        "empty": "EmptyState with primary CTA",
        "error": "Inline Alert with retry button"
      },
      "data_testids": {
        "table": "data-table",
        "search": "data-table-search-input",
        "filters": "data-table-filters",
        "sort": "data-table-sort-button",
        "pagination": "data-table-pagination"
      }
    },

    "TabbedDetail": {
      "tabs": ["Details", "Items", "Documents", "Activity"],
      "use_shadcn": ["Tabs", "Card", "Separator"],
      "layout": "Main column: Tabs content; Right rail: status + related records",
      "tailwind": {
        "tabs_list": "bg-muted/40 p-1 rounded-lg",
        "tabs_trigger": "data-[state=active]:bg-background data-[state=active]:shadow-[0_1px_0_rgba(15,23,42,0.04)]",
        "rail": "space-y-4"
      },
      "data_testids": {
        "tabs": "detail-tabs",
        "tab-details": "detail-tab-details",
        "tab-items": "detail-tab-items",
        "tab-documents": "detail-tab-documents",
        "tab-activity": "detail-tab-activity"
      }
    },

    "AuditTimeline": {
      "goal": "Compact chronological log",
      "structure": "Vertical list with subtle left border; each item shows actor, action, relative time",
      "tailwind": {
        "wrap": "rounded-xl border bg-card",
        "list": "divide-y",
        "item": "p-3 flex gap-3",
        "dot": "mt-1 h-2 w-2 rounded-full bg-muted-foreground/40",
        "text": "text-sm",
        "meta": "text-xs text-muted-foreground"
      },
      "data_testids": {
        "timeline": "audit-timeline",
        "item": "audit-timeline-item"
      }
    },

    "EmptyState": {
      "use": "All list pages + empty tabs",
      "composition": "Icon + title + description + primary action",
      "tailwind": {
        "wrap": "rounded-xl border bg-card p-8 text-left",
        "title": "mt-4 text-base font-semibold",
        "desc": "mt-1 text-sm text-muted-foreground",
        "actions": "mt-4 flex items-center gap-2"
      },
      "data_testids": {
        "empty": "empty-state",
        "primary": "empty-state-primary-action"
      }
    },

    "LoadingSkeleton": {
      "use_shadcn": ["Skeleton"],
      "patterns": [
        "Page header skeleton: title bar + 2 action buttons",
        "Table skeleton: header + 10 rows",
        "Detail skeleton: left content blocks + right rail cards"
      ],
      "data_testids": {
        "skeleton": "loading-skeleton"
      }
    },

    "ComposeEmailModal": {
      "use_shadcn": ["Dialog", "Select", "Input", "Textarea", "Button", "ScrollArea"],
      "layout": "Two-column on desktop: left form, right attachments picker; single column on mobile",
      "fields": [
        "To (read-only customer email)",
        "Template selector",
        "Subject",
        "Body (Textarea)",
        "Attachments (from Documents system)",
        "Send button"
      ],
      "tailwind": {
        "dialog": "sm:max-w-[860px]",
        "grid": "grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]",
        "attachments": "rounded-lg border bg-muted/20"
      },
      "data_testids": {
        "open": "compose-email-open-button",
        "modal": "compose-email-modal",
        "template": "compose-email-template-select",
        "subject": "compose-email-subject-input",
        "body": "compose-email-body-textarea",
        "attachments": "compose-email-attachments",
        "send": "compose-email-send-button"
      }
    },

    "AttachmentList": {
      "use": "Documents tab + entity detail",
      "row": "File icon + name + size + visibility toggle + actions",
      "actions": ["Preview", "Download", "Detach/Delete"],
      "tailwind": {
        "wrap": "rounded-xl border bg-card",
        "row": "flex items-center justify-between gap-3 p-3 hover:bg-muted/40",
        "name": "text-sm font-medium truncate",
        "meta": "text-xs text-muted-foreground"
      },
      "data_testids": {
        "list": "attachment-list",
        "row": "attachment-row",
        "download": "attachment-download-button",
        "toggle": "attachment-visibility-toggle"
      }
    },

    "FileUploadDropzone": {
      "use": "Documents page upload",
      "behavior": [
        "Drag-and-drop + click to browse",
        "Show upload progress",
        "Validate tenant scope before upload",
        "After upload: toast success + insert into list"
      ],
      "tailwind": {
        "zone": "rounded-xl border border-dashed bg-muted/20 p-6 hover:bg-muted/30",
        "hint": "text-sm text-muted-foreground"
      },
      "data_testids": {
        "dropzone": "file-upload-dropzone",
        "browse": "file-upload-browse-button"
      }
    },

    "MoneyInput": {
      "purpose": "Manual money entry; store cents; display formatted USD",
      "rules": [
        "Allow typing dollars.cents; sanitize to cents on blur",
        "Show formatted preview to the right (muted)",
        "Use tabular-nums and right alignment",
        "No calculators"
      ],
      "tailwind": {
        "wrap": "relative",
        "input": "pr-24 text-right tabular-nums",
        "preview": "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
      },
      "data_testids": {
        "input": "money-input",
        "preview": "money-input-preview"
      }
    }
  },

  "screen_mocks": {
    "dashboard": {
      "description": "No charts. 4 stat cards + 4 focused lists.",
      "layout_tokens": {
        "header_background": "use gradient header-wash only behind top 160px of content",
        "grid": "lg:grid-cols-12 gap-6",
        "stat_cards": "col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        "lists": [
          "Quotes needing follow-up (col-span-12 lg:col-span-6)",
          "Work orders needing attention (col-span-12 lg:col-span-6)",
          "Unpaid invoices (col-span-12 lg:col-span-7)",
          "Recent activity + recent emails (col-span-12 lg:col-span-5 stacked)"
        ]
      },
      "components": ["PageHeader", "StatCard", "DataTable (compact list variant)", "AuditTimeline (compact)"]
    },

    "order_detail": {
      "description": "Header + tabs + right rail. Items tab contains inline editable table.",
      "layout_tokens": {
        "outer": "lg:grid lg:grid-cols-[1fr_360px] gap-6",
        "main": "space-y-4",
        "rail": "space-y-4",
        "items_table": "DataTable variant with editable cells; add/remove row buttons"
      },
      "components": ["DetailHeader", "TabbedDetail", "StatusPill", "MoneyInput", "AttachmentList", "AuditTimeline"]
    }
  },

  "accessibility": {
    "requirements": [
      "WCAG AA contrast for text and UI boundaries",
      "Visible focus states on all interactive elements",
      "Keyboard navigable tables (sort buttons, row actions)",
      "Use aria-label for icon-only buttons",
      "Do not rely on color alone for status"
    ],
    "focus_style": "Use focus-visible ring tokens (see shadow.focus_ring).",
    "reduced_motion": "Respect prefers-reduced-motion: disable page transitions and reduce skeleton pulse"
  },

  "instructions_to_main_agent": {
    "global_css": [
      "Replace default body font stack with Inter; set display font via utility class or CSS variable.",
      "Do NOT use .App { text-align:center } (keep natural reading flow).",
      "Keep gradients minimal and only in header wash area (<20% viewport).",
      "Use tabular-nums for all money and counts."
    ],
    "data_testid_convention": {
      "rule": "kebab-case, role-based",
      "examples": [
        "customers-table-search-input",
        "orders-list-create-button",
        "order-items-add-row-button",
        "invoice-payments-add-payment-button",
        "documents-upload-dropzone"
      ]
    },
    "list_pages": [
      "Every list page must include: PageHeader, filters row, DataTable, LoadingSkeleton, EmptyState, error Alert, Pagination.",
      "Default table density: 10–15 rows per page; keep pagination visible."
    ],
    "detail_pages": [
      "Every detail page must include: DetailHeader, Tabs (Details/Items/Documents/Activity), right rail for status + related records.",
      "Reuse AuditTimeline across entities."
    ],
    "email": [
      "ComposeEmailModal uses Dialog; template selection via Select; attachments via AttachmentList picker.",
      "Email failures appear as a small indicator in Topbar (not a full notification center)."
    ]
  },

  "image_urls": {
    "note": "This is an internal tool UI; avoid stock photography. Use subtle textures only.",
    "recommended": [
      {
        "category": "texture",
        "description": "Very subtle noise overlay (CSS) for header wash only",
        "url": "(use CSS noise; no external image required)"
      }
    ]
  }
}

---

<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
     • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
