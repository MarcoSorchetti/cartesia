from fastapi import APIRouter

router = APIRouter()


@router.get("/hello")
def say_hello():
    return {"message": "Hello from JB Consulenti router!"}


@router.get("/hello/{name}")
def personalized_hello(name: str):
    return {"message": f"Ciao {name}, benvenuto su JB Consulenti!"}
