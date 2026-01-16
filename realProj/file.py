import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import xgboost as xgb
import time
from collections import deque

# --- CONFIGURATION ---

import os

# 1. Get the directory where THIS script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# 2. Force Python to look for the model in that specific directory
# Make sure the filename here matches your file EXACTLY
MODEL_PATH = os.path.join(script_dir, "temp_100_video_model.json")

print(f"📂 Looking for model at: {MODEL_PATH}")

# 3. Double check if it exists before crashing
if not os.path.exists(MODEL_PATH):
    print("❌ ERROR: File not found at the path above.")
    print("Files actually in this folder:")
    print(os.listdir(script_dir)) # Lists what Python can actually see
    exit()


BUFFER_SIZE = 150  # Number of frames to analyze (approx 5 seconds @ 30fps)

# --- 1. SETUP MEDIAPIPE ---
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

# --- 2. LOAD YOUR TRAINED MODEL ---
print("Loading AI Model...")
model = xgb.XGBRegressor()
model.load_model(MODEL_PATH)
print("✅ Model Loaded!")

# --- 3. HELPER CLASS (Same as Kaggle) ---
class BodyLanguageProcessor:
    def __init__(self):
        self.holistic = mp_holistic.Holistic(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
    
    def process(self, frame):
        # Convert to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.holistic.process(image)
        
        # Extract features if available
        if results.pose_landmarks and results.face_landmarks:
            # 1. Wrist (Left + Right avg)
            left_wrist = results.pose_landmarks.landmark[mp_holistic.PoseLandmark.LEFT_WRIST]
            right_wrist = results.pose_landmarks.landmark[mp_holistic.PoseLandmark.RIGHT_WRIST]
            wrist_x = (left_wrist.x + right_wrist.x) / 2
            wrist_y = (left_wrist.y + right_wrist.y) / 2
            
            # 2. Stability (Nose)
            nose = results.pose_landmarks.landmark[mp_holistic.PoseLandmark.NOSE]
            stab_x, stab_y = nose.x, nose.y
            
            # --- 3. UPGRADED ATTENTION LOGIC (Yaw & Pitch) ---
            left_ear = results.pose_landmarks.landmark[mp_holistic.PoseLandmark.LEFT_EAR]
            right_ear = results.pose_landmarks.landmark[mp_holistic.PoseLandmark.RIGHT_EAR]
            
            # Calculate the midpoint between ears (The geometric center of the head)
            ear_mid_x = (left_ear.x + right_ear.x) / 2
            ear_mid_y = (left_ear.y + right_ear.y) / 2
            
            # Calculate how far the nose is from that midpoint
            # If you look straight, nose is close to mid_x. 
            # If you turn head left/right, nose moves away from mid_x.
            offset_x = abs(nose.x - ear_mid_x)
            offset_y = abs(nose.y - ear_mid_y)
            
            # Euclidean distance from center (How "off-center" is your face?)
            dist_from_center = (offset_x**2 + offset_y**2)**0.5
            
            # Logic: If distance > 0.1, you are looking away.
            # We map this to a score: 0.0 (Looking Side) to 1.0 (Looking Front)
            # The multiplier 5.0 makes it sensitive enough to catch small turns.
            attn_score = max(0, 1.0 - (dist_from_center * 5.0))
            
            return {
                "wrist": [wrist_x, wrist_y],
                "stability": [stab_x, stab_y],
                "attention": attn_score
            }
        return None

# --- 4. MAIN APPLICATION LOOP ---
def main():
    cap = cv2.VideoCapture(0) # 0 = Your Default Webcam
    processor = BodyLanguageProcessor()
    
    # Buffers to store the last 5 seconds of data
    wrist_buffer = deque(maxlen=BUFFER_SIZE)
    stab_buffer = deque(maxlen=BUFFER_SIZE)
    attn_buffer = deque(maxlen=BUFFER_SIZE)
    
    current_score = 0.0
    feedback_text = "Analyzing..."

    # ... inside main() function ...

    # --- INITIALIZE VARIABLES FOR DISPLAY ---
    # We set default values so the screen isn't empty at the start
    disp_attention = 0.0
    disp_stability = 0.0
    disp_smoothness = 0.0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break

        # Process Frame
        metrics = processor.process(frame)
        
        if metrics:
            wrist_buffer.append(metrics['wrist'])
            stab_buffer.append(metrics['stability'])
            attn_buffer.append(metrics['attention'])

        # --- UPDATE NUMBERS EVERY 30 FRAMES ---
        if len(wrist_buffer) == BUFFER_SIZE and len(wrist_buffer) % 30 == 0:
            
            # 1. Calculate Raw Physics
            stab_arr = np.array(stab_buffer)
            var_stab = np.std(stab_arr, axis=0).mean()
            
            wrist_arr = np.array(wrist_buffer)
            velocity = np.diff(wrist_arr, axis=0)
            accel = np.diff(velocity, axis=0)
            jerk = np.diff(accel, axis=0)
            jerk_score = np.linalg.norm(jerk, axis=1).mean()
            
            attn_mean = np.mean(attn_buffer)
            
            # 2. Convert to 0-100 Scale (Using our calibrated math)
            disp_stability = max(0, min(100, 100 - (var_stab * 1000))) 
            disp_smoothness = max(0, min(100, 100 - (jerk_score * 100)))
            disp_attention = min(100, attn_mean * 100)

        # --- DRAW THE DASHBOARD ---
        # Draw a semi-transparent black box for readability
        overlay = frame.copy()
        cv2.rectangle(overlay, (10, 10), (350, 130), (0, 0, 0), -1)
        frame = cv2.addWeighted(overlay, 0.6, frame, 0.4, 0)

        # Line 1: Attention
        cv2.putText(frame, f"ATTENTION:  {disp_attention:.1f}/100", (20, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2) # Yellow

        # Line 2: Stability
        cv2.putText(frame, f"STABILITY:  {disp_stability:.1f}/100", (20, 80), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)   # Green

        # Line 3: Smoothness
        cv2.putText(frame, f"SMOOTHNESS: {disp_smoothness:.1f}/100", (20, 120), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 100, 255), 2) # Pink

        cv2.imshow('AI Interview Coach', frame)

        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()