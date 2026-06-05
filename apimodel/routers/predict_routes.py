from fastapi import APIRouter
from schemas import BurnoutInput, MBIInput, EmotionInput, LifestyleInput
from ml.predictor import predictor_instance

#routing predict for burnout, mbi, emotion, lifestyle model
router = APIRouter(prefix="/api/predict", tags=["Predictions"])

@router.post("/burnout")
def api_predict_burnout(data: BurnoutInput):
    score = predictor_instance.predict_burnout(data.features)
    return {"burnout_score": score}

@router.post("/mbi")
def api_predict_mbi(data: MBIInput):
    return predictor_instance.predict_mbi(data.items)

@router.post("/emotion")
def api_predict_emotion(data: EmotionInput):
    return predictor_instance.predict_emotion(data.teks_curhat)

@router.post("/lifestyle")
def api_predict_lifestyle(data: LifestyleInput):
    return predictor_instance.predict_lifestyle(data.features)