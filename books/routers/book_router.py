from fastapi import APIRouter, status, Depends, HTTPException, Response
from typing import List
from sqlalchemy import join
from sqlalchemy.orm import Session, join
from .. import schemas, models, oAuth2
from ..database import get_db
from .login_router import login

router = APIRouter(tags=['Books'])


@router.get('/all_books', status_code=status.HTTP_200_OK, response_model=List[schemas.ShowBook])
def get_all_books(db: Session = Depends(get_db)):
    books = db.query(models.BookDB, models.UserDB.name)\
        .join(models.UserDB, models.BookDB.creator == models.UserDB.email)\
        .order_by(models.BookDB.title)
    books_with_users = []
    for book, user_name in books:
        books_with_users.append({
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "description": book.description,
            "creator": user_name
        })
    return books_with_users


@router.get('/my_books/{email}', status_code=status.HTTP_200_OK, response_model=List[schemas.ShowBook])
def get_my_books(email, response: Response, db: Session = Depends(get_db), current_user: schemas.User = Depends(oAuth2.get_current_user)):
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    books = db.query(models.BookDB).filter(models.BookDB.creator == email)

    return books


# @router.get('/my_books/get_single_book/{id}', status_code=200, response_model=schemas.ShowBook)
# def get_single_book(id, db: Session = Depends(get_db), current_user: schemas.User = Depends(oAuth2.get_current_user)):
#     book = db.query(models.BookDB).filter(models.BookDB.id == id).first()
#     if not book:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='book was not found')
#
#     return book


@router.post('/my_books/create_book', status_code=status.HTTP_201_CREATED)
def create_book(request: schemas.Book, db: Session = Depends(get_db),
                current_user: schemas.User = Depends(oAuth2.get_current_user)):
    new_book = models.BookDB(title=request.title, author=request.author,
                             description=request.description, creator=request.creator)
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book


@router.delete('/my_books/delete_book/{book_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id, db: Session = Depends(get_db), current_user: schemas.User = Depends(oAuth2.get_current_user)):
    book = db.query(models.BookDB).filter(models.BookDB.id == book_id)
    if not book.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Book not found')

    book.delete(synchronize_session=False)
    db.commit()


@router.put('/my_books/update_book/{book_id}', status_code=status.HTTP_202_ACCEPTED)
def update_book(book_id, request: schemas.Book, db: Session = Depends(get_db),
                current_user: schemas.User = Depends(oAuth2.get_current_user)):
    book = db.query(models.BookDB).filter(models.BookDB.id == book_id)
    new_book = models.BookDB(title=request.title, author=request.author,
                             description=request.description, creator=request.creator)
    if not book.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Book not found')
    book.update(request.dict())
    db.commit()
