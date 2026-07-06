from __future__ import annotations

from typing import Literal, Optional

from pydantic import Field

from .base import BaseDoc

AttachmentParentType = Literal[
    "customer", "quote", "order", "order_item", "work_order", "invoice", "email", "generic"
]
FileVisibility = Literal["internal", "customer_visible"]


class FileRecord(BaseDoc):
    tenant_id: str
    storage_key: str  # path in object storage
    original_filename: str
    mime_type: str
    size_bytes: int
    uploaded_by: str  # user_id
    visibility: FileVisibility = "internal"
    sha256: Optional[str] = None
    archived: bool = False


class Attachment(BaseDoc):
    tenant_id: str
    file_id: str
    parent_type: AttachmentParentType
    parent_id: str
    attached_by: str
    note: Optional[str] = None
