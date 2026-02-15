# setting up fastapi app

from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "NutriKart API is Running!"}