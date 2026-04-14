from sqlalchemy import Column, Integer, String, Numeric, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from .database import Base


class Category(Base):
    __tablename__ = "categories"

    id   = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    name          = Column(String, nullable=False)
    category_id   = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    price_per_unit = Column(Numeric(10, 2))
    serving_size  = Column(Numeric(6, 2))
    calories      = Column(Numeric(6, 2))
    sugar         = Column(Numeric(6, 2))
    sodium        = Column(Numeric(6, 2))
    protein       = Column(Numeric(6, 2))
    fat           = Column(Numeric(6, 2))
    saturated_fat = Column(Numeric(6, 2))
    fiber         = Column(Numeric(6, 2))
    image_url     = Column(String, nullable=True)

    # Provenance, basis and identity fields for Upgrade 2
    brand         = Column(String, nullable=True)
    variant       = Column(String, nullable=True)
    pack_quantity = Column(Numeric(10, 2), nullable=True)
    pack_unit     = Column(String, nullable=True, default="g")
    serving_unit  = Column(String, nullable=True, default="g")
    measurement_basis = Column(String, nullable=True, default="per_serving")
    verification_status = Column(String, nullable=False, default="verified")
    source_type   = Column(String, nullable=True, default="seed")
    source_ref    = Column(String, nullable=True)
    version       = Column(Integer, nullable=False, default=1)

    category = relationship("Category", back_populates="products")

    __table_args__ = (
        Index("ix_products_name", "name"),
    )