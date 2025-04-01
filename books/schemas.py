from typing import List, Optional, Annotated
from pydantic import BaseModel


class Book(BaseModel):
    title: str
    author: str
    description: str
    creator: str

    class Config():
        from_attributes = True


class User(BaseModel):
    name: str
    email: str
    password: str

    class Config():
        from_attributes = True


class ShowUser(BaseModel):
    name: str
    email: str

    class Config():
        from_attributes = True


# class ShowUserEmail(BaseModel):
#     email: str
#
#     class Config():
#         from_attributes = True


class ShowBook(BaseModel):
    id: int
    title: str
    author: str
    description: str
    creator: str

    class Config():
        from_attributes = True


# class Login(BaseModel):
#     email: str
#     password: str
#
#     class Config():
#         from_attributes = True
#
#
class Token(BaseModel):
    access_token: str
    token_type: str

    class Config():
        from_attributes = True


class TokenData(BaseModel):
    email: Optional[str] = None

    class Config():
        from_attributes = True