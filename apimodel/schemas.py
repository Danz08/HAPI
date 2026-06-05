from pydantic import BaseModel, Field

class BurnoutInput(BaseModel):
    features: list[float] = Field(..., min_items=12, max_items=12)

class MBIInput(BaseModel):
    items: list[int] = Field(..., min_items=15, max_items=15)

class EmotionInput(BaseModel):
    teks_curhat: str = Field(..., min_length=1)

class LifestyleInput(BaseModel):
    features: list[float] = Field(..., min_items=7, max_items=7)