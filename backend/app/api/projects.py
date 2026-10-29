from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy.orm import Session

from app.repositories.project import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.project import ProjectService

router = APIRouter(prefix="/api/projects", tags=["projects"])


def get_session(request: Request):
    with Session(request.app.state.database_engine) as session:
        yield session


def get_service(session: Annotated[Session, Depends(get_session)]):
    return ProjectService(ProjectRepository(session))


Service = Annotated[ProjectService, Depends(get_service)]


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(data: ProjectCreate, service: Service):
    return service.create(data)


@router.get("", response_model=list[ProjectResponse])
def list_projects(
    service: Service,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
):
    return service.repository.list(offset, limit)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: UUID, service: Service):
    return service.get(project_id)


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: UUID, data: ProjectUpdate, service: Service):
    return service.update(project_id, data)


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: UUID, service: Service):
    service.delete(project_id)
    return Response(status_code=204)
