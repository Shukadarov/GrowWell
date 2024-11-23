import threading
from flask import Flask, g
from flask_cors import CORS
import cv2
from deepface import DeepFace


dominant_emotion = 'sad'

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    CORS(app, resources={r"*": {"origins": "http://localhost:*"}})

    # a simple page that says hello
    @app.route('/hello')
    def hello():
        return 'Hello, Wordld!'
    
    # a simple page that says hello
    @app.route('/emotion')
    def getEmotion():
        print(dominant_emotion)
        return dominant_emotion

    return app


def detect_emotion():
    global dominant_emotion
    # Load face cascade classifier
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    # Start capturing video
    cap = cv2.VideoCapture(0)

    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()

        # Convert frame to grayscale
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Convert grayscale frame to RGB format
        rgb_frame = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2RGB)

        # Detect faces in the frame
        faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        for (x, y, w, h) in faces:
            # Extract the face ROI (Region of Interest)
            face_roi = rgb_frame[y:y + h, x:x + w]

            
            # Perform emotion analysis on the face ROI
            result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)

            # Determine the dominant emotion
            emotion = result[0]['dominant_emotion']
            dominant_emotion = emotion
            # Draw rectangle around face and label with predicted emotion
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
            cv2.putText(frame, emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)

        # Display the resulting frame
        cv2.imshow('Real-time Emotion Detection', frame)

        # Press 'q' to exit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release the capture and close all windows
    cap.release()
    cv2.destroyAllWindows()

application = create_app()

if __name__ == '__main__':

    
    thread2 = threading.Thread(target=application.run)
    thread2.start()
    
thread1 = threading.Thread(target=detect_emotion)
thread1.start()


