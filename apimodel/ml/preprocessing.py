import emoji
import re
import pickle
from tensorflow.keras.preprocessing.sequence import pad_sequences

KAMUS_EMOJI = {
    '😭': ' menangis parah ', '😢': ' sedih ', '😔': ' murung ',
    '😡': ' sangat marah ', '🤬': ' marah besar ', '😨': ' takut ',
    '😱': ' panik ', '😊': ' senang ', '😂': ' tertawa ',
    '😩': ' sangat lelah ', '😫': ' frustasi '
}

def bersihkan_dan_translate_emoji(teks: str) -> str:
    teks = str(teks)
    for emj, arti in KAMUS_EMOJI.items():
        teks = teks.replace(emj, arti)
        
    teks = emoji.demojize(teks, delimiters=(" ", " "))
    teks = teks.replace('_', ' ')
    teks = re.sub(r'[^\w\s]', ' ', teks)
    teks = re.sub(r'\s+', ' ', teks).strip().lower()
    return teks

def preprocess_text_for_model(teks: str, tokenizer_path='saved_models/tokenizer.pkl', max_len=50):
    teks_bersih = bersihkan_dan_translate_emoji(teks)
    
    # Load tokenizer yang sudah dilatih (Anda perlu export menggunakan pickle di Colab)
    with open(tokenizer_path, 'rb') as handle:
        tokenizer = pickle.load(handle)
        
    sekuens = tokenizer.texts_to_sequences([teks_bersih])
    padded = pad_sequences(sekuens, maxlen=max_len, padding='post', truncating='post')
    return padded