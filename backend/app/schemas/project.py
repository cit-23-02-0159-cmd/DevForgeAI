from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.project import ProjectStatus


class ProjectCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=10000)
    status: ProjectStatus = ProjectStatus.draft


class ProjectUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=10000)
    status: ProjectStatus | None = None

    @model_validator(mode="after")
    def reject_null_fields(self):
        if any(getattr(self, field) is None for field in self.model_fields_set):
            raise ValueError("Project fields cannot be null")
        return self


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    description: str
    status: ProjectStatus
    created_at: datetime
    updated_at: datetime
