import React, { useEffect, useMemo, useState } from "react";
import { Activity, Calculator, ChevronRight, FileText, FolderOpen, Link, PackagePlus, Plus, Save, Search, ShoppingBag, Upload, UserRound } from "lucide-react";
import { customerDisplayName, loadSharedCustomers } from "../customers/customerCore";
import { api } from "../../lib/api";

const orderStatuses = ["", "draft", "new_intake", "awaiting_review", "awaiting_quote", "quote_sent", "awaiting_approval", "approved", "in_production", "partially_complete", "ready_for_pickup", "out_for_delivery", "completed", "on_hold", "cancelled"];
const actionableOrderStatuses = orderStatuses.filter(Boolean);
const itemStatuses = ["new", "awaiting_info", "awaiting_proof", "awaiting_approval", "approved", "queued", "in_production", "in_qc", "ready", "completed", "on_hold", "rework", "cancelled"];
const categories = ["banners", "rigid_signs", "cut_vinyl", "digital_print", "vehicle_wrap", "apparel", "services", "promo_misc", "custom"];
const detailTabs = ["Order Items", "Production", "Financial", "Drawings", "Files", "Notes", "Activity"];

const emptyOrderDraft = { customer_id: "", customer_name: "", contact_name: "", email: "", phone: "", company_name: "", order_source: "email", order_title: "" };
const emptyItemDraft = { item_name: "", item_category: "banners", quantity: 1, unit_type: "each" };

export function OrdersWorkspace({ onToast, onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerConnection, setCustomerConnection] = useState("checking");
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("Order Items");
  const [activity, setActivity] = useState([]);
  const [files, setFiles] = useState({ file_links: [], document_links: [] });
  const [filters, setFilters] = useState({ query: "", status: "" });
  const [orderDraft, setOrderDraft] = useState(emptyOrderDraft);
  const [itemDraft, setItemDraft] = useState(emptyItemDraft);

  const loadOrders = () => api(`/orders${filters.status ? `?status=${filters.status}` : ""}`)
    .then((rows) => {
      setOrders(rows);
      if (!activeOrder && rows.length) openOrder(rows[0].id);
    })
    .catch((error) => onToast?.(error.message || "Unable to load orders"));

  const refreshOrder = async (orderId = activeOrder?.id) => {
    if (!orderId) return;
    const order = await api(`/orders/${orderId}`);
    setActiveOrder(order);
    setOrders((current) => current.map((row) => row.id === order.id ? { ...row, ...order, items: undefined } : row));
    api(`/orders/${orderId}/activity`).then(setActivity).catch(() => {});
  };

  useEffect(() => {
    loadOrders();
    loadSharedCustomers()
      .then(({ rows, connection }) => {
        setCustomers(rows);
        setCustomerConnection(connection);
      })
      .catch(() => setCustomerConnection("offline"));
  }, []);

  const openOrder = async (orderId) => {
    const order = await api(`/orders/${orderId}`);
    setActiveOrder(order);
    setActiveTab("Order Items");
    Promise.all([api(`/orders/${orderId}/activity`), api(`/orders/${orderId}/files`)])
      .then(([activityRows, fileRows]) => { setActivity(activityRows); setFiles(fileRows); })
      .catch(() => {});
  };

  const visibleOrders = useMemo(() => {
    const needle = filters.query.toLowerCase();
    return orders.filter((order) => !needle || `${order.order_number} ${order.customer_name} ${order.order_title} ${order.status}`.toLowerCase().includes(needle));
  }, [orders, filters.query]);

  const selectCustomer = (customerId) => {
    const customer = customers.find((row) => row.id === customerId);
    if (!customer) return setOrderDraft({ ...orderDraft, customer_id: "" });
    setOrderDraft({
      ...orderDraft,
      customer_id: customer.id,
      customer_name: customerDisplayName(customer),
      company_name: customer.businessName || "",
      contact_name: `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
      email: customer.email || "",
      phone: customer.phone || "",
    });
  };

  const createOrder = async () => {
    if (!orderDraft.customer_name.trim()) return onToast?.("Customer name is required");
    const created = await api("/orders", { method: "POST", body: JSON.stringify(orderDraft) });
    setOrders((current) => [created, ...current]);
    setOrderDraft(emptyOrderDraft);
    await openOrder(created.id);
    onToast?.("Order created");
  };

  const createItem = async () => {
    if (!activeOrder) return onToast?.("Open an order first");
    if (!itemDraft.item_name.trim()) return onToast?.("Item name is required");
    const created = await api(`/orders/${activeOrder.id}/items`, { method: "POST", body: JSON.stringify(itemDraft) });
    setActiveOrder((current) => ({ ...current, items: [...(current.items || []), created], job_ticket_count: (current.job_ticket_count || 0) + 1 }));
    setItemDraft(emptyItemDraft);
    onToast?.("Order item created");
  };

  const saveItemSpecs = async (item, specs) => {
    await api(`/job-tickets/${item.id}`, { method: "PUT", body: JSON.stringify({ specs }) });
    await refreshOrder();
    onToast?.("Item specs saved");
  };

  const calculateItem = async (item, specs = item.specs || {}) => {
    const result = await api(`/job-tickets/${item.id}/save-pricing`, { method: "POST", body: JSON.stringify({ specs }) });
    await refreshOrder();
    onToast?.(`Price calculated: ${money(result.calculation.selling_price_minor)}`);
  };

  const updateOrderStatus = async (status) => {
    if (!activeOrder || status === activeOrder.status) return;
    await api(`/orders/${activeOrder.id}`, { method: "PUT", body: JSON.stringify({ status }) });
    await refreshOrder();
    onToast?.(`Order moved to ${label(status)}`);
  };

  const nextOrderStep = async () => {
    if (!activeOrder) return;
    const currentIndex = actionableOrderStatuses.indexOf(activeOrder.status);
    const nextStatus = actionableOrderStatuses[Math.min(currentIndex + 1, actionableOrderStatuses.length - 1)] || "new_intake";
    await updateOrderStatus(nextStatus);
  };

  const updateItemStatus = async (item, status) => {
    if (status === item.status) return;
    await api(`/job-tickets/${item.id}`, { method: "PUT", body: JSON.stringify({ status }) });
    await refreshOrder();
    onToast?.(`${item.ticket_number} moved to ${label(status)}`);
  };

  const uploadOrderFile = async (file) => {
    if (!file || !activeOrder) return;
    const form = new FormData();
    form.append("file", file);
    form.append("entity_type", "order");
    form.append("entity_id", activeOrder.id);
    form.append("relationship_type", "order_file");
    await api("/doculink/files/upload", { method: "POST", body: form });
    setFiles(await api(`/orders/${activeOrder.id}/files`));
    onToast?.("File uploaded and linked to order");
  };

  return (
    <div className="orders-workspace">
      <section className="orders-hero">
        <div><span>Operations</span><h1>Orders</h1><p>Order to Order Items / Job Tickets to quotes, invoices, work orders, and production tasks.</p></div>
        <button className="primary-button" onClick={createOrder}><Plus size={16} />Create Order</button>
      </section>

      <section className="orders-create">
        <select value={orderDraft.customer_id} onChange={(event) => selectCustomer(event.target.value)}>
          <option value="">Select shared customer ({customerConnection})</option>
          {customers.map((customer) => <option key={customer.id} value={customer.id}>{customerDisplayName(customer)} - {customer.email || "no email"}</option>)}
        </select>
        <input value={orderDraft.customer_name} onChange={(event) => setOrderDraft({ ...orderDraft, customer_name: event.target.value })} placeholder="Customer name" />
        <input value={orderDraft.order_title} onChange={(event) => setOrderDraft({ ...orderDraft, order_title: event.target.value })} placeholder="Order title" />
        <input value={orderDraft.contact_name} onChange={(event) => setOrderDraft({ ...orderDraft, contact_name: event.target.value })} placeholder="Contact" />
        <input value={orderDraft.email} onChange={(event) => setOrderDraft({ ...orderDraft, email: event.target.value })} placeholder="Email" />
        <input value={orderDraft.phone} onChange={(event) => setOrderDraft({ ...orderDraft, phone: event.target.value })} placeholder="Phone" />
        <select value={orderDraft.order_source} onChange={(event) => setOrderDraft({ ...orderDraft, order_source: event.target.value })}><option>phone</option><option>walk_in</option><option>email</option><option>website</option><option>repeat_order</option><option>sales_rep</option><option>webstore</option></select>
        <button type="button" onClick={() => onNavigate?.("operations", "customers")}><UserRound size={14} />Open Customers</button>
      </section>

      <section className="orders-layout">
        <aside className="orders-list-panel">
          <div className="orders-filters"><label><Search size={15} /><input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Search orders" /></label><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>{orderStatuses.map((status) => <option key={status} value={status}>{status || "All statuses"}</option>)}</select><button onClick={loadOrders}>Apply</button></div>
          <div className="orders-list">{visibleOrders.map((order) => <button key={order.id} className={activeOrder?.id === order.id ? "active" : ""} onClick={() => openOrder(order.id)}><ShoppingBag size={17} /><span><strong>{order.order_number}</strong><small>{order.customer_name || "No customer"} - {label(order.status)}</small></span><b>{money(order.estimated_total_minor)}</b></button>)}</div>
        </aside>

        <main className="order-detail-panel">
          {!activeOrder ? <Empty title="No order selected" text="Create or select an order to manage job tickets." /> : <>
            <header className="order-detail-header">
              <div><span>{label(activeOrder.status)}</span><h2>{activeOrder.order_number} {activeOrder.order_title || activeOrder.name}</h2><p>{activeOrder.customer_name} · {activeOrder.job_ticket_count || 0} items · {activeOrder.overall_progress || 0}% complete</p></div>
              <div className="order-status-controls"><strong>{money(activeOrder.estimated_total_minor)}</strong><select value={activeOrder.status} onChange={(event) => updateOrderStatus(event.target.value)}>{actionableOrderStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select><button onClick={nextOrderStep}>Next Step</button></div>
            </header>
            <nav className="order-detail-tabs">{detailTabs.map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
            {activeTab === "Order Items" && <OrderItemsTab order={activeOrder} draft={itemDraft} setDraft={setItemDraft} createItem={createItem} saveItemSpecs={saveItemSpecs} calculateItem={calculateItem} updateItemStatus={updateItemStatus} />}
            {activeTab === "Production" && <Placeholder icon={PackagePlus} title="Production task foundation next" text="Production tasks will be generated from item category workflow templates in the next phase." />}
            {activeTab === "Financial" && <FinancialTab order={activeOrder} />}
            {activeTab === "Drawings" && <Placeholder icon={FileText} title="Drawings use DocuLink" text="Order drawings and markups will be linked through DocuLink file/document IDs." />}
            {activeTab === "Files" && <FilesTab order={activeOrder} files={files} uploadOrderFile={uploadOrderFile} onOpenDocuLink={() => onNavigate?.("operations", "documents")} />}
            {activeTab === "Notes" && <NotesTab order={activeOrder} />}
            {activeTab === "Activity" && <ActivityTab activity={activity} />}
          </>}
        </main>
      </section>
    </div>
  );
}

function OrderItemsTab({ order, draft, setDraft, createItem, saveItemSpecs, calculateItem, updateItemStatus }) {
  return <section className="order-tab-panel">
    <div className="order-item-create"><input value={draft.item_name} onChange={(event) => setDraft({ ...draft, item_name: event.target.value })} placeholder="Item name / job ticket description" /><select value={draft.item_category} onChange={(event) => setDraft({ ...draft, item_category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select><input type="number" value={draft.quantity} onChange={(event) => setDraft({ ...draft, quantity: Number(event.target.value) })} /><button onClick={createItem}><Plus size={15} />Add Item</button></div>
    <div className="order-items-grid">{(order.items || []).map((item) => <OrderItemCard key={item.id} item={item} saveItemSpecs={saveItemSpecs} calculateItem={calculateItem} updateItemStatus={updateItemStatus} />)}</div>
    {!order.items?.length && <Empty title="No order items yet" text="Add the first job ticket to start pricing and production planning." />}
  </section>;
}

function OrderItemCard({ item, saveItemSpecs, calculateItem, updateItemStatus }) {
  const [expanded, setExpanded] = useState(false);
  const [schema, setSchema] = useState([]);
  const [specs, setSpecs] = useState(item.specs || {});

  useEffect(() => { setSpecs(item.specs || {}); }, [item.id, item.specs]);
  useEffect(() => {
    if (!expanded) return;
    api(`/job-tickets/schema/${item.item_category}`).then((row) => setSchema(row.fields || [])).catch(() => setSchema([]));
  }, [expanded, item.item_category]);

  const setSpec = (key, value, type) => setSpecs((current) => ({ ...current, [key]: type === "number" ? Number(value || 0) : type === "toggle" ? Boolean(value) : value }));

  return <article>
    <div><strong>{item.ticket_number}</strong><span>{item.item_category}</span></div>
    <h3>{item.item_name}</h3>
    <p>{item.description || "No item description yet."}</p>
    <dl><div><dt>Qty</dt><dd>{item.quantity}</dd></div><div><dt>Status</dt><dd>{label(item.status)}</dd></div><div><dt>Price</dt><dd>{money(item.estimated_price_minor)}</dd></div></dl>
    <div className="order-item-status-row"><span>Item Status</span><select value={item.status} onChange={(event) => updateItemStatus(item, event.target.value)}>{itemStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></div>
    <div className="order-item-actions">
      <button onClick={() => setExpanded((value) => !value)}><FileText size={14} />{expanded ? "Hide Specs" : "Edit Specs"}</button>
      <button onClick={() => calculateItem(item, specs)}><Calculator size={14} />Calculate</button>
      {item.item_category === "vehicle_wrap" && <button><ChevronRight size={14} />Open Wrap Command Center</button>}
    </div>
    {expanded && <div className="order-spec-editor">
      {schema.map((field) => <label key={field.key}>
        <span>{field.label}{field.affects_price ? " *" : ""}</span>
        {field.type === "select" ? <select value={specs[field.key] ?? ""} onChange={(event) => setSpec(field.key, event.target.value, field.type)}><option value="">Select</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>
          : field.type === "toggle" ? <input type="checkbox" checked={Boolean(specs[field.key])} onChange={(event) => setSpec(field.key, event.target.checked, field.type)} />
          : field.type === "textarea" ? <textarea value={specs[field.key] ?? ""} onChange={(event) => setSpec(field.key, event.target.value, field.type)} />
          : <input type={field.type === "number" ? "number" : "text"} value={specs[field.key] ?? ""} onChange={(event) => setSpec(field.key, event.target.value, field.type)} />}
      </label>)}
      <div className="order-spec-actions"><button onClick={() => saveItemSpecs(item, specs)}><Save size={14} />Save Specs</button><button onClick={() => calculateItem(item, specs)}><Calculator size={14} />Save Price</button></div>
    </div>}
  </article>;
}

function FinancialTab({ order }) {
  return <section className="order-tab-panel order-financial-grid"><article><span>Estimated Total</span><strong>{money(order.estimated_total_minor)}</strong><p>Built from order item pricing snapshots.</p></article><article><span>Payment Status</span><strong>{order.payment_status}</strong><p>Invoices and payments come in the billing phase.</p></article><article><span>Balance Due</span><strong>{money(order.estimated_total_minor)}</strong><p>Quote/invoice generation is intentionally scaffolded only.</p></article></section>;
}

function FilesTab({ order, files, uploadOrderFile, onOpenDocuLink }) {
  const links = [...(files.file_links || []), ...(files.document_links || [])];
  return <section className="order-tab-panel"><div className="orders-file-callout"><Upload size={20} /><span><strong>DocuLink files for {order.order_number}</strong><small>Uploads are stored in DocuLink and linked back to this order record.</small></span><label><input type="file" onChange={(event) => uploadOrderFile(event.target.files?.[0])} />Upload File</label><button onClick={onOpenDocuLink}><FolderOpen size={14} />Open DocuLink</button></div><div className="orders-linked-list">{links.map((row) => <p key={row.id}><Link size={14} />{row.relationship_type} · {row.file_id || row.document_id}</p>)}</div>{!links.length && <Empty title="No linked files yet" text="Upload here or link files from DocuLink." />}</section>;
}

function NotesTab({ order }) {
  return <section className="order-tab-panel order-notes-grid"><article><span>Internal Notes</span><p>{order.internal_notes || "No internal notes."}</p></article><article><span>Customer Notes</span><p>{order.customer_notes || "No customer-visible notes."}</p></article><article><span>Shared Production Context</span><p>{order.shared_production_notes || "No shared production notes."}</p></article><article><span>Design / Color / Install</span><p>{[order.shared_design_notes, order.shared_color_brand_notes, order.shared_install_notes].filter(Boolean).join(" · ") || "No shared context yet."}</p></article></section>;
}

function ActivityTab({ activity }) {
  return <section className="order-tab-panel"><div className="orders-activity-list">{activity.map((event) => <p key={event.id}><Activity size={14} /><strong>{label(event.event_type)}</strong><small>{event.order_item_id || "order-level"}</small></p>)}</div>{!activity.length && <Empty title="No activity yet" text="Order events will appear here." />}</section>;
}

function Placeholder({ icon: Icon, title, text }) { return <section className="order-tab-panel"><Empty icon={Icon} title={title} text={text} /></section>; }
function Empty({ icon: Icon = ShoppingBag, title, text }) { return <div className="orders-empty"><Icon size={28} /><h2>{title}</h2><p>{text}</p></div>; }
function money(value = 0) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format((Number(value) || 0) / 100); }
function label(value = "") { return String(value || "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()); }
