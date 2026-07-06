"""Central permission catalog.

All routes gate through require_permission(...) in app.deps.
Role -> permissions mapping is authoritative here; frontend fetches it from /api/auth/me.
"""
from __future__ import annotations

from enum import Enum


class Perm(str, Enum):
    # Customers
    CUSTOMER_READ = "customer:read"
    CUSTOMER_WRITE = "customer:write"
    # Quotes
    QUOTE_READ = "quote:read"
    QUOTE_WRITE = "quote:write"
    QUOTE_CONVERT = "quote:convert"
    # Orders + Order Items
    ORDER_READ = "order:read"
    ORDER_WRITE = "order:write"
    # Work Orders
    WORK_ORDER_READ = "work_order:read"
    WORK_ORDER_WRITE = "work_order:write"
    # Invoices + Payments
    INVOICE_READ = "invoice:read"
    INVOICE_WRITE = "invoice:write"
    PAYMENT_WRITE = "payment:write"
    # Documents
    DOCUMENT_READ = "document:read"
    DOCUMENT_WRITE = "document:write"
    # Emails
    EMAIL_READ = "email:read"
    EMAIL_SEND = "email:send"
    # Audit
    AUDIT_READ = "audit:read"
    # Users / admin
    USER_READ = "user:read"
    USER_WRITE = "user:write"
    # Dashboard
    DASHBOARD_READ = "dashboard:read"


OWNER_ADMIN_PERMS: list[str] = [p.value for p in Perm]

STAFF_PERMS: list[str] = [
    Perm.CUSTOMER_READ.value, Perm.CUSTOMER_WRITE.value,
    Perm.QUOTE_READ.value, Perm.QUOTE_WRITE.value, Perm.QUOTE_CONVERT.value,
    Perm.ORDER_READ.value, Perm.ORDER_WRITE.value,
    Perm.WORK_ORDER_READ.value, Perm.WORK_ORDER_WRITE.value,
    Perm.INVOICE_READ.value, Perm.INVOICE_WRITE.value, Perm.PAYMENT_WRITE.value,
    Perm.DOCUMENT_READ.value, Perm.DOCUMENT_WRITE.value,
    Perm.EMAIL_READ.value, Perm.EMAIL_SEND.value,
    Perm.AUDIT_READ.value,
    Perm.DASHBOARD_READ.value,
]

ROLE_PERMISSIONS: dict[str, list[str]] = {
    "owner": OWNER_ADMIN_PERMS,
    "admin": OWNER_ADMIN_PERMS,
    "staff": STAFF_PERMS,
}


def permissions_for_role(role: str) -> list[str]:
    return ROLE_PERMISSIONS.get(role, [])
