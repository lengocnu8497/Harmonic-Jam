import uuid

from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, validator
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List

from backend.db import database
from backend.routes.companies import (
    CompanyBatchOutput,
    fetch_companies_with_liked,
)

router = APIRouter(
    prefix="/collections",
    tags=["collections"],
)


class CompanyCollectionMetadata(BaseModel):
    id: uuid.UUID
    collection_name: str


class CompanyCollectionOutput(CompanyBatchOutput, CompanyCollectionMetadata):
    pass


class AddCompaniesRequest(BaseModel):
    company_ids: List[int]
    origin_collection_id: uuid.UUID
    destination_collection_id: uuid.UUID

    @validator('company_ids')
    def validate_company_ids(cls, v):
        if not v:
            raise ValueError('company_ids cannot be empty')
        if len(set(v)) != len(v):
            raise ValueError('company_ids must be unique')
        return v

    @validator('destination_collection_id')
    def validate_different_collections(cls, v, values):
        if 'origin_collection_id' in values and v == values['origin_collection_id']:
            raise ValueError('origin and destination collections must be different')
        return v


class AddCompaniesResponse(BaseModel):
    message: str
    companies_added: int
    companies_already_in_destination: int


@router.get("", response_model=list[CompanyCollectionMetadata])
def get_all_collection_metadata(
    db: Session = Depends(database.get_db),
):
    collections = db.query(database.CompanyCollection).all()

    return [
        CompanyCollectionMetadata(
            id=collection.id,
            collection_name=collection.collection_name,
        )
        for collection in collections
    ]


@router.get("/{collection_id}", response_model=CompanyCollectionOutput)
def get_company_collection_by_id(
    collection_id: uuid.UUID,
    offset: int = Query(
        0, description="The number of items to skip from the beginning"
    ),
    limit: int = Query(10, description="The number of items to fetch"),
    db: Session = Depends(database.get_db),
):
    query = (
        db.query(database.CompanyCollectionAssociation, database.Company)
        .join(database.Company)
        .filter(database.CompanyCollectionAssociation.collection_id == collection_id)
    )

    total_count = query.with_entities(func.count()).scalar()

    results = query.offset(offset).limit(limit).all()
    companies = fetch_companies_with_liked(db, [company.id for _, company in results])

    return CompanyCollectionOutput(
        id=collection_id,
        collection_name=db.query(database.CompanyCollection)
        .get(collection_id)
        .collection_name,
        companies=companies,
        total=total_count,
    )


@router.put("/add-companies", response_model=AddCompaniesResponse)
def add_companies_to_collection(
    request: AddCompaniesRequest,
    db: Session = Depends(database.get_db),
):
    """Add companies from origin collection to destination collection."""

    # Validate that both collections exist
    origin_collection = db.query(database.CompanyCollection).filter(
        database.CompanyCollection.id == request.origin_collection_id
    ).first()

    if not origin_collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Origin collection {request.origin_collection_id} not found"
        )

    destination_collection = db.query(database.CompanyCollection).filter(
        database.CompanyCollection.id == request.destination_collection_id
    ).first()

    if not destination_collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination collection {request.destination_collection_id} not found"
        )

    # Move companies from origin to destination collection
    try:
        # Check which companies are already in destination collection
        existing_companies = db.query(database.CompanyCollectionAssociation).filter(
            database.CompanyCollectionAssociation.collection_id == request.destination_collection_id,
            database.CompanyCollectionAssociation.company_id.in_(request.company_ids)
        ).all()

        existing_company_ids = {assoc.company_id for assoc in existing_companies}
        companies_to_move = [company_id for company_id in request.company_ids if company_id not in existing_company_ids]

        # Add only non-duplicate companies to destination collection using bulk insert
        if companies_to_move:
            associations = [
                {
                    "company_id": company_id,
                    "collection_id": request.destination_collection_id
                }
                for company_id in companies_to_move
            ]

            db.bulk_insert_mappings(database.CompanyCollectionAssociation, associations)

        db.commit()

        return AddCompaniesResponse(
            message=f"Successfully moved {len(companies_to_move)} companies to destination collection",
            companies_added=len(companies_to_move),
            companies_already_in_destination=len(existing_company_ids)
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to move companies between collections: {str(e)}"
        )
