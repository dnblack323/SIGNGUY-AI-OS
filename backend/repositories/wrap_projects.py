from pymongo import DESCENDING, ReturnDocument

try:
    from ..shared.dates import utc_now
    from ..shared.ids import new_id
    from ..shared.indexes import ensure_collection_indexes
    from .wrap_project_children import WrapProjectChildRepository
except ImportError:
    from shared.dates import utc_now
    from shared.ids import new_id
    from shared.indexes import ensure_collection_indexes
    from repositories.wrap_project_children import WrapProjectChildRepository


class WrapProjectRepository:
    def __init__(self, database):
        self.database = database
        self.collection = database.wrap_projects
        self.children = WrapProjectChildRepository(database)

    async def ensure_indexes(self):
        await ensure_collection_indexes(self.collection, "wrap_projects")
        await self.children.ensure_indexes()

    async def list(self, tenant_id: str):
        projects = await self.collection.find(
            {"tenant_id": tenant_id}, {"_id": 0}
        ).sort("updated_at", DESCENDING).to_list(length=500)
        return await self.children.hydrate_projects(tenant_id, projects)

    async def get(self, tenant_id: str, project_id: str):
        project = await self.collection.find_one(
            {"tenant_id": tenant_id, "id": project_id}, {"_id": 0}
        )
        return await self.children.hydrate_project(tenant_id, project)

    async def create(self, tenant_id: str, project: dict):
        now = utc_now()
        parent, children = self.children.split_project(project)
        document = {
            **parent,
            "id": project.get("id") or new_id(),
            "tenant_id": tenant_id,
            "created_at": now,
            "updated_at": now,
            "version": 1,
        }
        await self.collection.insert_one(document.copy())
        await self.children.replace_children(tenant_id, document["id"], children)
        document.pop("_id", None)
        return await self.children.hydrate_project(tenant_id, document)

    async def replace(self, tenant_id: str, project_id: str, project: dict):
        current = await self.get(tenant_id, project_id)
        if not current:
            return None
        parent, children = self.children.split_project(project)
        document = {
            **parent,
            "id": project_id,
            "tenant_id": tenant_id,
            "created_at": current["created_at"],
            "updated_at": utc_now(),
            "version": int(current.get("version", 1)) + 1,
        }
        updated = await self.collection.find_one_and_replace(
            {"tenant_id": tenant_id, "id": project_id},
            document,
            projection={"_id": 0},
            return_document=ReturnDocument.AFTER,
        )
        await self.children.replace_children(tenant_id, project_id, children)
        return await self.children.hydrate_project(tenant_id, updated)

    async def patch(self, tenant_id: str, project_id: str, fields: dict):
        fields = {k: v for k, v in fields.items() if k not in {"id", "tenant_id", "tenantId", "created_at", "createdAt"}}
        parent_fields, children = self.children.split_project(fields)
        if children:
            await self.children.replace_children(tenant_id, project_id, children)
        fields = parent_fields
        fields["updated_at"] = utc_now()
        updated = await self.collection.find_one_and_update(
            {"tenant_id": tenant_id, "id": project_id},
            {"$set": fields, "$inc": {"version": 1}},
            projection={"_id": 0},
            return_document=ReturnDocument.AFTER,
        )
        return await self.children.hydrate_project(tenant_id, updated)

    async def append_child(self, tenant_id: str, project_id: str, record_type: str, payload: dict):
        child = await self.children.append_child(tenant_id, project_id, record_type, payload)
        await self.collection.update_one(
            {"tenant_id": tenant_id, "id": project_id},
            {"$set": {"updated_at": utc_now()}, "$inc": {"version": 1}},
        )
        return child

    async def delete(self, tenant_id: str, project_id: str) -> bool:
        result = await self.collection.delete_one({"tenant_id": tenant_id, "id": project_id})
        if result.deleted_count == 1:
            await self.children.collection.delete_many({"tenant_id": tenant_id, "project_id": project_id})
        return result.deleted_count == 1
