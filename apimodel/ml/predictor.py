import numpy as np
import tensorflow as tf
from .custom_objects import WeightedBurnoutLoss, TextAttentionLayer
from .preprocessing import preprocess_text_for_model

class HAPIPredictor:
    def __init__(self):
        # Load semua model saat server startup
        self.model_a = tf.keras.models.load_model(
            'saved_models/burnout_predictor.keras', 
            custom_objects={'WeightedBurnoutLoss': WeightedBurnoutLoss}
        )
        self.model_b = tf.keras.models.load_model('saved_models/mbi_scorer.keras')
        
        self.model_c = tf.keras.models.load_model(
            'saved_models/emotion_classifier.keras',
            custom_objects={'TextAttentionLayer': TextAttentionLayer}
        )
        self.model_ls = tf.keras.models.load_model('saved_models/lifestyle_stress_predictor.keras')

    def predict_burnout(self, features: list):
        x = np.array([features], dtype=np.float32)
        score = self.model_a.predict(x, verbose=0)[0][0]
        return float(score)

    def predict_mbi(self, items: list):
        x = np.array(items).reshape(1, 15)
        probs = self.model_b.predict(x, verbose=0)[0]
        return {
            'risk_level': ['Low', 'Medium', 'High'][np.argmax(probs)], 
            'confidence': float(np.max(probs))
        }

    def predict_emotion(self, text: str):
        x_padded = preprocess_text_for_model(text)
        probs = self.model_c.predict(x_padded, verbose=0)[0]
        labels = ['Senang', 'Sedih', 'Marah', 'Takut', 'Lelah'] 
        return {
            'emotion': labels[np.argmax(probs)],
            'confidence': float(np.max(probs))
        }

    def predict_lifestyle(self, features: list):
        x = np.array([features], dtype=np.float32)
        probs = self.model_ls.predict(x, verbose=0)[0]
        return {
            'stress_level': ['Low', 'Moderate', 'High'][np.argmax(probs)], 
            'confidence': float(np.max(probs))
        }

# load instance
predictor_instance = HAPIPredictor()