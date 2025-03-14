from fastapi import APIRouter, status
from typing import List
from .. import schemas, database


router = APIRouter()

@router.get('/book', status_code=status.HTTP_200_OK, response_model=List[schemas.ShowBook], tags=['Books'])
def get_all_books(db: Session = Depends(database.get_db)):
    books = db.query(models.Book).all()
    return books