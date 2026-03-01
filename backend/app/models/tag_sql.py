from sqlalchemy import Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship
from app.database import Base

# Tabella associativa many-to-many impianti <-> tags
impianto_tags = Table(
    "impianto_tags",
    Base.metadata,
    Column("impianto_id", Integer, ForeignKey("impianti.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(50), unique=True, nullable=False, index=True)
    colore = Column(String(7), nullable=True, server_default="'#2563eb'")

    impianti = relationship("Impianto", secondary=impianto_tags, back_populates="tags")
