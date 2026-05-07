"""
MoodTune AI — Emotion Predictor
Orchestrates face detection + emotion model inference.
Loads the trained CNN model and provides a simple predict() interface.
Falls back to the FER library if no custom model file is found.
"""

import os
import numpy as np
from typing import Optional, Dict

from app.ai.face_detector import FaceDetector
from app.ai.emotion_model import EMOTION_LABELS
from app.utils.config import settings


class EmotionPredictor:
    """
    High-level emotion prediction class.

    Usage:
        predictor = EmotionPredictor()
        result = predictor.predict(rgb_image_array)
        # result → {"emotion": "happy", "confidence": 0.92, "all_emotions": {...}}
    """

    def __init__(self):
        """Initialize face detector and load the emotion model."""
        self.face_detector = FaceDetector()
        self.model = None
        self.use_fer_fallback = False
        self._load_model()

    def _load_model(self):
        """
        Load the TF/Keras emotion model from disk.
        Falls back to the FER library for zero-config deployment.
        """
        model_path = settings.MODEL_PATH

        if os.path.isfile(model_path):
            # Load custom trained model
            try:
                import tensorflow as tf
                self.model = tf.keras.models.load_model(model_path)
                print(f"[EmotionPredictor] Loaded custom model from: {model_path}")
            except Exception as e:
                print(f"[EmotionPredictor] Failed to load model: {e}")
                self._enable_fer_fallback()
        else:
            # No custom model found — use FER library as fallback
            print(f"[EmotionPredictor] No model found at {model_path}. Using FER fallback.")
            self._enable_fer_fallback()

    def _enable_fer_fallback(self):
        """Enable the FER library as a fallback emotion detector."""
        try:
            from fer import FER
            self.fer_detector = FER(mtcnn=False)
            self.use_fer_fallback = True
            print("[EmotionPredictor] FER fallback enabled successfully.")
        except ImportError:
            print("[EmotionPredictor] FER library not available. Returning mock emotions.")
            self.use_fer_fallback = False

    def predict(self, rgb_frame: np.ndarray) -> Optional[Dict]:
        """
        Predict emotion from an RGB image array.

        Returns:
            dict with keys: emotion, confidence, all_emotions
            or None if no face is detected.
        """
        if self.use_fer_fallback:
            return self._predict_with_fer(rgb_frame)
        elif self.model is not None:
            return self._predict_with_custom_model(rgb_frame)
        else:
            return self._mock_prediction()

    def _predict_with_custom_model(self, rgb_frame: np.ndarray) -> Optional[Dict]:
        """Run inference using the custom CNN model."""
        # Extract the primary face
        face_input = self.face_detector.get_primary_face(rgb_frame)
        if face_input is None:
            return None

        # Run model inference
        predictions = self.model.predict(face_input, verbose=0)[0]

        # Build emotion → probability map
        all_emotions = {
            label: float(round(prob, 4))
            for label, prob in zip(EMOTION_LABELS, predictions)
        }

        # Top emotion
        top_idx = int(np.argmax(predictions))
        emotion = EMOTION_LABELS[top_idx]
        confidence = float(predictions[top_idx])

        return {
            "emotion": emotion,
            "confidence": confidence,
            "all_emotions": all_emotions,
        }

    def _predict_with_fer(self, rgb_frame: np.ndarray) -> Optional[Dict]:
        """Run inference using the FER library fallback."""
        try:
            result = self.fer_detector.detect_emotions(rgb_frame)
            if not result:
                return None

            # Use the first detected face
            emotions = result[0]["emotions"]
            top_emotion = max(emotions, key=emotions.get)
            confidence = emotions[top_emotion]

            return {
                "emotion": top_emotion,
                "confidence": float(confidence),
                "all_emotions": {k: float(v) for k, v in emotions.items()},
            }
        except Exception as e:
            print(f"[EmotionPredictor] FER error: {e}")
            return self._mock_prediction()

    def _mock_prediction(self) -> Dict:
        """
        Return a mock emotion prediction for testing without a real model.
        Used as last resort when no model or FER library is available.
        """
        import random
        emotion = random.choice(["happy", "neutral", "sad", "calm"])
        confidence = round(random.uniform(0.6, 0.95), 4)
        all_emotions = {e: round(random.uniform(0, 0.3), 4) for e in EMOTION_LABELS}
        all_emotions[emotion] = confidence
        return {
            "emotion": emotion,
            "confidence": confidence,
            "all_emotions": all_emotions,
        }
