from uuid import UUID

from fastapi import HTTPException

from app.models.project import Project
from app.repositories.project import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(self, repository: ProjectRepository):
        self.repository = repository

    def get(self, project_id: UUID):
        project = self.repository.get(project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        return project

    def create(self, data: ProjectCreate):
        return self.repository.save(Project(**data.model_dump()))

    def update(self, project_id: UUID, data: ProjectUpdate):
        project = self.get(project_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(project, field, value)
        return self.repository.save(project)

    def delete(self, project_id: UUID):
        self.repository.delete(self.get(project_id))
