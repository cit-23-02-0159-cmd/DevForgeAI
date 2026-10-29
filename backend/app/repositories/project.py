from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project


class ProjectRepository:
    def __init__(self, session: Session):
        self.session = session

    def list(self, offset: int, limit: int):
        return self.session.scalars(
            select(Project).order_by(Project.created_at.desc(), Project.id)
            .offset(offset).limit(limit)
        ).all()

    def get(self, project_id: UUID):
        return self.session.get(Project, project_id)

    def save(self, project: Project):
        self.session.add(project)
        self.session.commit()
        self.session.refresh(project)
        return project

    def delete(self, project: Project):
        self.session.delete(project)
        self.session.commit()
