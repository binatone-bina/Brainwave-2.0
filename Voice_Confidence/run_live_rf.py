import pyaudio
import numpy as np
import joblib
import librosa
from features import extract_features 

# Loading our model
model = joblib.load("Voice_Confidence\confidence_rf_model.pkl")

# Configuration
SAMPLE_RATE = 22050
DURATION = 5 # Analyze last 3 seconds
CHUNK_SIZE = 1024

# Using filter detection
def get_linguistic_penalty(audio_chunk, sr):
    """
    Checks for 'Droning' (Ummm/Ahhh).
    Returns a penalty factor (1.0 = No Penalty, 0.5 = High Penalty).
    """
    # Spectral Flatness: Fillers are 'flat' (tonal), Speech is 'spiky' (noisy)
    flatness = librosa.feature.spectral_flatness(y=audio_chunk)
    avg_flatness = np.mean(flatness)
    
    # If sound is very flat (pure tone) and long -> Likely a filler "Ummmmm"
    if avg_flatness < 0.01:
        return 0.5
    return 1.0

p = pyaudio.PyAudio()
stream = p.open(format=pyaudio.paFloat32, channels=1, rate=SAMPLE_RATE, input=True, frames_per_buffer=CHUNK_SIZE)
buffer = np.zeros(SAMPLE_RATE * DURATION, dtype=np.float32)

print("--- LISTENING FOR PHYSICS FEATURES ---")
print("[Pitch | Jitter | HNR | Rate] -> Confidence")

try:
    while True:
        data = stream.read(CHUNK_SIZE, exception_on_overflow=False)
        new_audio = np.frombuffer(data, dtype=np.float32)
        buffer = np.roll(buffer, -len(new_audio))
        buffer[-len(new_audio):] = new_audio

        # Check Silence
        if np.mean(np.abs(new_audio)) < 0.01:
            print("\r[Silence...]", end="")
            continue

        # 1. Extract Acoustic Features (The 8 metrics)
        feats = extract_features(audio_array=buffer, sample_rate=SAMPLE_RATE)
        
        # Handle NaNs (if audio chunk was bad)
        if np.isnan(feats).any():
            continue

        # 2. Predict Acoustic Confidence (0 or 1)
        # We use .predict_proba to get a score between 0.0 and 1.0
        acoustic_score = model.predict_proba([feats])[0][1] * 100

        # 3. Apply Linguistic Penalty
        penalty = get_linguistic_penalty(buffer, SAMPLE_RATE)
        final_score = acoustic_score * penalty

        # Visualize specific metrics that caused the score
        jitter_val = feats[4] # Jitter is index 4
        hnr_val = feats[6]    # HNR is index 6
        
        label = "CONFIDENT" if final_score > 50 else "NERVOUS  "
        color = "\033[92m" if final_score > 50 else "\033[91m"
        reset = "\033[0m"

        print(f"\r{color}Score: {final_score:.1f}% | {label} | Jitter: {jitter_val:.4f} | HNR: {hnr_val:.2f}{reset}", end="")

except KeyboardInterrupt:
    print("\nStopped.")