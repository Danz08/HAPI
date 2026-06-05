from fastapi import FastAPI
from routers import predict_routes

app = FastAPI(
    title='HAPI Multi-Model API',
    description='API Modular untuk 4 model HAPI Project',
    version='2.0.0'
)

# routing model
app.include_router(predict_routes.router)

@app.get('/')
def home():
    return {
        'message': 'API Server is Running!', 
        'status': 'Active',
        'available_models': ['burnout', 'mbi', 'emotion', 'lifestyle']
    }

# run this in terminal: 
# uvicorn main:app --reload