from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, oAuth2
from ..hashing import Hash
from ..database import get_db

router = APIRouter(prefix='/user', tags=['Users'])


@router.post('/create_user', status_code=status.HTTP_201_CREATED, response_model=schemas.ShowUser)
def create_user(request: schemas.User, db: Session = Depends(get_db)):
    if db.query(models.UserDB).filter(models.UserDB.email == request.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Email address is already registered')

    hashed_password = Hash.bcrypt_func(request.password)
    new_user = models.UserDB(name=request.name, email=request.email, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get('/{id}', response_model=schemas.ShowUser)
def get_user(id: int, db: Session = Depends(get_db)):
    user = db.query(models.UserDB).filter(models.UserDB.id == id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='user was not found')

    return user


@router.get('/get_user_id/{user_email}')
def get_user_id(user_email, db: Session = Depends(get_db), current_user: schemas.User = Depends(oAuth2.get_current_user)):
    user_id = db.query(models.UserDB).filter(models.UserDB.email == user_email).first().id
    # if not user:
    #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='user was not found')
    return {'user_id': user_id}
