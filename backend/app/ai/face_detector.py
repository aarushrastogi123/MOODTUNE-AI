"""
MoodTune AI — Face Detector
Handles face detection from image frames using OpenCV's Haar Cascade classifier.
Extracts and preprocesses face regions for emotion classification.
"""

import cv2
import numpy as np
from typing import Optional, List, Tuple

# Path to OpenCV's pre-trained face cascade
FACE_CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"

# Preprocessed face size (must match emotion model input)
FACE_SIZE = 48


class FaceDetector:
    """
    Detects faces in images using OpenCV Haar Cascade.
    Preprocesses detected faces for emotion model inference.
    """

    def __init__(self):
        """Load the Haar Cascade face detector at initialization."""
        self.face_cascade = cv2.CascadeClassifier(FACE_CASCADE_PATH)
        if self.face_cascade.empty():
            raise RuntimeError(
                "Failed to load face cascade classifier. "
                "Check OpenCV installation."
            )

    def detect_faces(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detect faces in a BGR or RGB frame.
        Returns a list of (x, y, w, h) bounding boxes.
        """
        # Convert to grayscale for Haar cascade
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY) if len(frame.shape) == 3 else frame

        # Detect faces — parameters tuned for real-time webcam use
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,      # Scale image by 10% each step
            minNeighbors=5,       # Minimum neighbors for detection
            minSize=(30, 30),     # Minimum face size in pixels
            flags=cv2.CASCADE_SCALE_IMAGE,
        )

        if len(faces) == 0:
            return []

        return [(int(x), int(y), int(w), int(h)) for (x, y, w, h) in faces]

    def extract_face(
        self,
        frame: np.ndarray,
        bbox: Tuple[int, int, int, int],
        padding: int = 10,
    ) -> np.ndarray:
        """
        Extract and preprocess a single face region for the emotion model.

        Steps:
        1. Add padding around the bounding box
        2. Crop face region
        3. Convert to grayscale
        4. Resize to FACE_SIZE × FACE_SIZE
        5. Normalize to [0, 1]
        6. Reshape for model input (1, 48, 48, 1)
        """
        x, y, w, h = bbox
        height, width = frame.shape[:2]

        # Apply padding with boundary clipping
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(width, x + w + padding)
        y2 = min(height, y + h + padding)

        # Crop the face region
        face_crop = frame[y1:y2, x1:x2]

        # Convert RGB → grayscale
        if len(face_crop.shape) == 3:
            face_gray = cv2.cvtColor(face_crop, cv2.COLOR_RGB2GRAY)
        else:
            face_gray = face_crop

        # Resize to model input size
        face_resized = cv2.resize(face_gray, (FACE_SIZE, FACE_SIZE))

        # Normalize pixel values to [0, 1]
        face_normalized = face_resized.astype(np.float32) / 255.0

        # Reshape to (1, 48, 48, 1) — batch of 1
        face_input = face_normalized.reshape(1, FACE_SIZE, FACE_SIZE, 1)

        return face_input

    def get_primary_face(self, frame: np.ndarray) -> Optional[np.ndarray]:
        """
        Detect faces and return the largest one (assumed to be primary subject).
        Returns preprocessed face array or None if no face detected.
        """
        faces = self.detect_faces(frame)
        if not faces:
            return None

        # Select the largest face by area
        primary = max(faces, key=lambda f: f[2] * f[3])
        return self.extract_face(frame, primary)

    def draw_face_boxes(
        self,
        frame: np.ndarray,
        faces: List[Tuple[int, int, int, int]],
        emotion_labels: List[str] = None,
    ) -> np.ndarray:
        """
        Draw bounding boxes on detected faces for debug/preview display.
        Optionally overlays emotion labels above each box.
        """
        output = frame.copy()
        for i, (x, y, w, h) in enumerate(faces):
            # Draw rectangle
            cv2.rectangle(output, (x, y), (x + w, y + h), (0, 255, 100), 2)

            # Draw emotion label if provided
            if emotion_labels and i < len(emotion_labels):
                label = emotion_labels[i]
                cv2.putText(
                    output, label,
                    (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8, (0, 255, 100), 2,
                )
        return output
