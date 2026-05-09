from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

# 1. Initialize the app
app = FastAPI()

# 2. Define a data model
class Item(BaseModel):
    name: str
    price: float
    is_offer: Optional[bool] = None

# 3. Create a GET endpoint
@app.get("/")
def read_root():
    return {"Hello": "LaunchLoop"}

# 4. Create a GET endpoint with parameters
@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None):
    return {"item_id": item_id, "q": q}

# 5. Create a POST endpoint
@app.post("/items/")
def create_item(item: Item):
    return {"message": "Item created", "item": item}

# To run this: uvicorn example_api:app --reload
