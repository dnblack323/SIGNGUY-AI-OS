import React, { useState } from "react";
import {
  Archive, BarChart3, BellRing, CalendarDays, Check, ChevronRight, CircleDollarSign, ClipboardCheck,
  Copy, Download, Edit3, Eye, FileCheck2, FileText, Filter, Globe2, ImagePlus, LayoutDashboard,
  Link, LockKeyhole, Mail, MessageSquareText, Package, Palette, Pause, Plus, QrCode, ReceiptText,
  RefreshCw, Rocket, Search, Send, Settings, Shirt, ShoppingCart, Sparkles, Store, Upload, Users,
  WalletCards, X,
} from "lucide-react";

const tabs = [
  ["home", "Home", LayoutDashboard], ["stores", "Stores", Store], ["templates", "Templates", Copy], ["orders", "Orders", ReceiptText],
  ["payments", "Payments", WalletCards], ["reports", "Reports", BarChart3], ["owner-portal", "Owner Portal", Users],
  ["settings", "Settings", Settings],
];

const ribbon = {
  home: ["New Store|Store", "Duplicate|Copy", "Send Questionnaire|Mail", "Review Answers|ClipboardCheck", "Pending Approvals|FileCheck2", "Launch Blockers|LockKeyhole", "Add Products|Shirt", "Preview Store|Eye", "Owner Review|Send", "Launch Store|Rocket", "New Orders|ReceiptText", "QR / Share|QrCode"],
  stores: ["New Store|Store", "Duplicate|Copy", "Edit Store|Edit3", "Store Details|Eye", "Questionnaire|Mail", "Review Answers|ClipboardCheck", "Add Products|Shirt", "Preview Store|Eye", "Owner Review|Send", "Launch / Pause|Rocket", "Archive|Archive", "QR / Share|QrCode"],
  templates: ["New Product|Shirt", "New Bundle|Package", "Duplicate|Copy", "Edit Template|Edit3", "Add Images|ImagePlus", "Archive|Archive", "Categories|Filter", "Default Price|CircleDollarSign", "Default Cost|WalletCards", "Copy To Store|Store", "Bundle Items|Plus", "Export|Download"],
  orders: ["New Orders|BellRing", "Filter|Filter", "Search|Search", "Processing|RefreshCw", "To Production|Send", "Mark Ready|Check", "Mark Shipped|Package", "Picked Up|Check", "Order Summary|FileText", "Pick List|ClipboardCheck", "Export|Download", "Email Customer|Mail"],
  payments: ["Stripe Status|WalletCards", "Stripe Dashboard|Globe2", "Refresh Health|RefreshCw", "Onboarding Link|Send", "Payments|ReceiptText", "Platform Fees|CircleDollarSign", "Owner Share|Users", "Payout Summary|BarChart3", "Export Payouts|Download", "Failed Transfers|LockKeyhole", "Retry Transfer|RefreshCw", "Payment Records|FileText"],
  reports: ["Sales|BarChart3", "Orders|ReceiptText", "Revenue|CircleDollarSign", "Top Products|Shirt", "Product Detail|Package", "Donations|CircleDollarSign", "Goal Progress|BarChart3", "Owner Share|Users", "Export CSV|Download", "Export PDF|FileText", "Date Range|CalendarDays", "Send Report|Send"],
  "owner-portal": ["Send Invite|Mail", "Magic Link|Link", "Create Access|Plus", "View As Owner|Eye", "Send Review|Send", "Change Requests|MessageSquareText", "Approval Status|FileCheck2", "Terms|FileText", "Approval History|Archive", "Owner QR|QrCode", "Analytics|BarChart3", "Portal Settings|Settings"],
  settings: ["Module Access|LockKeyhole", "Feature Gates|Settings", "Platform Fees|CircleDollarSign", "Default Fees|WalletCards", "Stripe|WalletCards", "Checkout|ShoppingCart", "Email Templates|Mail", "SMS Templates|MessageSquareText", "Terms Templates|FileText", "Approval Rules|FileCheck2", "Branding|Palette", "Audit Settings|Archive"],
};

const iconMap = { Archive, BarChart3, BellRing, CalendarDays, Check, CircleDollarSign, ClipboardCheck, Copy, Download, Edit3, Eye, FileCheck2, FileText, Filter, Globe2, ImagePlus, Link, LockKeyhole, Mail, MessageSquareText, Package, Palette, Pause, Plus, QrCode, ReceiptText, RefreshCw, Rocket, Search, Send, Settings, Shirt, ShoppingCart, Sparkles, Store, Upload, Users, WalletCards, X };
const stores = [
  { name: "Northstar Staff Store", type: "Employee", status: "Setup in progress", action: "Review product pricing", due: "Today" },
  { name: "City Arts Summer Fundraiser", type: "Fundraiser", status: "Owner review pending", action: "Owner terms pending", due: "1 day" },
  { name: "Beacon Coffee Merch", type: "General", status: "Questionnaire received", action: "Review new answers", due: "2 days" },
];
const storeTypes = ["B2B", "Fundraiser", "Event", "Promotional", "Employee", "General"];

export function WebstoresWorkspace({ standalone = false, onToast }) {
  const [tab, setTab] = useState("home");
  const [newStoreOpen, setNewStoreOpen] = useState(false);
  const notify = (message) => onToast?.(message);
  const action = (label) => label === "New Store" ? setNewStoreOpen(true) : notify(`${label} selected`);
  return <div className="webstores-workspace">
    <section className="webstore-heading"><div><span className="eyebrow">{standalone ? "Standalone Webstores" : "Webstores module"}</span><h1>{tab === "home" ? "Webstore Command Center" : tabs.find(([id]) => id === tab)[1]}</h1><p>{tab === "home" ? "Daily work, store management, owner approvals, launch readiness, and orders." : sectionDescriptions[tab]}</p></div><button className="primary-button" onClick={() => setNewStoreOpen(true)}><Plus size={16}/>New Store</button></section>
    <nav className="webstore-tabs" aria-label="Webstore top navigation">{tabs.map(([id,label,Icon])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><Icon size={15}/>{label}</button>)}</nav>
    <ContextRibbon tab={tab} action={action}/>
    {tab === "home" ? <HomeDashboard notify={notify} /> : <ContextPage tab={tab} notify={notify}/>}
    {newStoreOpen && <NewStoreDialog close={()=>setNewStoreOpen(false)} notify={notify}/>}
  </div>;
}

function ContextRibbon({tab,action}) {
  const groups=[["Primary",0,3],["Manage",3,6],["Review",6,9],["Complete",9,12]];
  return <section className="webstore-ribbon" aria-label={`${tab} actions`}>{groups.map(([name,start,end])=><div className="webstore-ribbon-group" key={name}><div>{ribbon[tab].slice(start,end).map(item=>{const [label,key]=item.split("|");const Icon=iconMap[key];return <button key={label} onClick={()=>action(label)}><Icon size={18}/><span>{label}</span></button>})}</div><small>{name}</small></div>)}</section>;
}

function HomeDashboard({notify}) {
  return <>
    <section className="webstore-home-hero">
      <div><span className="eyebrow">Monday, June 15</span><h2>Keep every store moving toward launch</h2><p>Review setup work, owner approvals, launch blockers, and incoming activity from one place.</p></div>
      <div className="hero-action-summary"><span><strong>3</strong><small>Need action</small></span><span><strong>2</strong><small>Owner reviews</small></span><button onClick={()=>notify("Launch blockers opened")}>Review priorities<ChevronRight size={15}/></button></div>
    </section>
    <section className="webstore-kpis">
      <Kpi label="Stores in setup" value="3" detail="2 need action" icon={Store}/>
      <Kpi label="Questionnaires waiting" value="1" detail="New answers received" icon={ClipboardCheck}/>
      <Kpi label="Owner approvals pending" value="2" detail="Oldest waiting 1 day" icon={FileCheck2}/>
      <Kpi label="Launch blockers" value="5" detail="Terms and Stripe" icon={LockKeyhole} gated/>
      <Kpi label="Live stores" value="0" detail="Publishing not active" icon={Globe2}/>
      <Kpi label="New orders" value="0" detail="Checkout not active" icon={ReceiptText}/>
    </section>
    <div className="webstore-home-grid">
      <section className="panel webstore-list span-two"><PanelTitle title="Stores needing action" action="View stores"/>{stores.map(s=><button className="webstore-row" key={s.name} onClick={()=>notify(`${s.name} opened`)}><span className="store-mark"><Store size={17}/></span><span><strong>{s.name}</strong><small>{s.type} · {s.status}</small></span><span className="store-action">{s.action}</span><span className="store-due">{s.due}</span><ChevronRight size={15}/></button>)}</section>
      <section className="panel"><PanelTitle title="Revenue snapshot"/><div className="revenue-snapshot"><strong>$0.00</strong><span>Standalone commerce not launched</span><p><CircleDollarSign size={14}/>5% platform fee applies after launch</p><p><WalletCards size={14}/>Owner funds route through Stripe Connect</p></div></section>
      <section className="panel"><PanelTitle title="New orders"/><div className="compact-empty"><ReceiptText size={23}/><strong>No new orders</strong><small>Orders appear here after stores launch.</small></div></section>
      <section className="panel span-two"><PanelTitle title="Recent activity" action="Audit log"/><div className="activity-list">{[["Questionnaire submitted","Beacon Coffee Merch · 24 min ago"],["Owner review sent","City Arts Summer Fundraiser · 3 hr ago"],["Products updated","Northstar Staff Store · Yesterday"]].map(([a,b])=><p key={a}><span/><strong>{a}</strong><small>{b}</small></p>)}</div></section>
      <section className="panel"><PanelTitle title="Standalone V1 workflow"/><div className="workflow-mini">{["Create Store","Send Questionnaire","Review Answers","Add Products","Preview Store","Owner Approves Terms","Stripe Ready","Launch Store","Accept Orders","View Reports"].map((x,i)=><p key={x} className={i<4?"done":""}><span>{i+1}</span>{x}</p>)}</div></section>
    </div>
  </>;
}

const sectionDescriptions={stores:"Manage stores and each store's own products, questionnaire, preview, approval, and launch workflow.",templates:"Reusable templates for apparel, signs, bundles, employee packs, and fundraiser packs. Copies become store-specific products.",orders:"Webstore orders, customer communication, production handoff, and exports.",payments:"Stripe Connect health, direct owner payouts, fees, transfers, and payment records.",reports:"Sales, orders, revenue, products, donations, goals, owner share, and exports.","owner-portal":"Owner invites, preview, approval, terms acceptance, QR code, Stripe onboarding, and analytics.",settings:"Feature gates, platform fees, Stripe, checkout, templates, approvals, branding, and audit rules."};

function ContextPage({tab,notify}) {
  const [,label,Icon]=tabs.find(([id])=>id===tab);
  const notes={
    stores:["Every store owns its own catalog","Questionnaire, products, preview, and owner review are managed from the selected store","Cost, selling price, variants, and owner share live per store product or variant"],
    payments:["Standalone default platform fee is 5% of eligible checkout amount","Owner money routes directly through Stripe Connect","Launch and checkout remain blocked until Stripe capabilities are ready"],
    "owner-portal":["Approval includes store and product/pricing approval","Owner accepts terms, platform fee, and Stripe payout acknowledgement","Approval stores timestamp, identity, and store snapshot reference"],
    settings:["Draft setup and preview remain available without active commerce","Publishing and checkout require entitlement, Stripe, terms, launch checks, and ready products","Locked costs, fees, payout rules, tax, and Stripe routing remain admin-controlled"],
  };
  return <section className="webstore-context-page"><div className="context-page-icon"><Icon size={25}/></div><div><span className="eyebrow">{label}</span><h2>{label} workspace</h2><p>{sectionDescriptions[tab]}</p></div><button className="primary-button" onClick={()=>notify(`${label} primary action selected`)}>Open {label}<ChevronRight size={15}/></button>{notes[tab]&&<div className="context-rule-list">{notes[tab].map(n=><p key={n}><Check size={13}/>{n}</p>)}</div>}</section>;
}

function NewStoreDialog({close,notify}) {
  return <div className="modal-backdrop" onMouseDown={close}><div className="new-store-dialog" onMouseDown={e=>e.stopPropagation()}><div className="modal-heading"><div><h2>Create New Store</h2><p>Select the store type. Type selection only appears during creation.</p></div><button onClick={close}><X size={18}/></button></div><div className="new-store-types">{storeTypes.map(type=><button key={type} onClick={()=>{notify(`${type} store draft created`);close();}}><Store size={19}/><strong>{type}</strong><small>Create draft and begin setup</small><ChevronRight size={14}/></button>)}</div></div></div>;
}

function Kpi({label,value,detail,icon:Icon,gated=false}){return <div className={gated?"webstore-kpi gated":"webstore-kpi"}><Icon size={17}/><span><small>{label}</small><strong>{value}</strong><em>{detail}</em></span>{gated&&<LockKeyhole size={13}/>}</div>}
function PanelTitle({title,action}){return <div className="panel-title"><div><h2>{title}</h2></div>{action&&<button>{action}<ChevronRight size={14}/></button>}</div>}

export function StandaloneWebstoresShell({onToast,backendStatus}) {
  return <div className="standalone-shell"><header className="standalone-topbar"><a className="standalone-brand" href="/?mode=webstores"><span className="standalone-logo-slot" title="Uploaded company logo appears here"><small>LOGO</small></span><strong>Webstores</strong></a><div className="standalone-product-label"><strong>Standalone</strong><span>Build, approve, launch, and operate branded Webstores</span></div><div><span className={`backend-status ${backendStatus}`}><i/>{backendStatus==="connected"?"Functional":backendStatus==="offline"?"Visual only":"Checking"}</span><span className="user-avatar small">BN</span></div></header><main><WebstoresWorkspace standalone onToast={onToast}/></main></div>;
}
