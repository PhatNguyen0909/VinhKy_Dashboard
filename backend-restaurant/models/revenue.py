from sqlalchemy import Column, Integer, Float, Date
from db import Base


class Revenue(Base):
    __tablename__ = "revenues"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, index=True)
    chuyen_khoan = Column(Float, default=0.0)
    tien_mat = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
