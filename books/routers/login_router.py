from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from .. import schemas, models
from ..hashing import Hash
from ..database import get_db
from ..token import create_access_token, verify_token


router = APIRouter(tags=['Authorization'])


@router.post("/login")
def login(request: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    user = db.query(models.UserDB).filter(models.UserDB.email == request.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User with that name not found :(')
    if not Hash.verify(user.password, request.password):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Incorrect password :[]')

    access_token = create_access_token(data={"sub": user.email})

    return schemas.Token(access_token=access_token, token_type="bearer")

