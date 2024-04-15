import cv2
from ultralytics import YOLO
from threading import Thread
import os

class SynthuraSecuritySystem:
    def __init__(self, model_path='yolov8n.pt'):
        """
        Initialize the Synthura Security System.
        
        Args:
            model_path (str): Path to the YOLOv8 model file.
        """
        self.model = self.load_model(model_path)
        self.camera_threads = []
        self.camera_results = {}

#------------------------------------------------------------------------------------------------#
    
    def load_model(self, model_path):
        """
        Load the YOLOv8 model.
        
        Args:
            model_path (str): Path to the YOLOv8 model file.
        
        Returns:
            model (YOLO): Loaded YOLOv8 model.
        """
        model_path = os.path.join(os.path.dirname(__file__), model_path)
        return YOLO(model_path)

#------------------------------------------------------------------------------------------------#

    def add_camera(self, camera_id):
        """
        Add a new camera to the security system.
        
        Args:
            camera_id (int): ID of the camera (e.g., 0 for the default laptop camera).
        """
        thread = Thread(target=self.camera_processing, args=(camera_id,))
        thread.start()
        self.camera_threads.append(thread)

#------------------------------------------------------------------------------------------------#

    def camera_processing(self, camera_id):
        """
        Process the camera feed and perform object detection.
        
        Args:
            camera_id (int): ID of the camera.
        """
        cap = cv2.VideoCapture(camera_id)
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            results = self.object_detection(frame)
            annotated_frame = self.frame_annotation(frame, results)
            
            self.camera_results[camera_id] = results
            
            self.display_frame(camera_id, annotated_frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()

#------------------------------------------------------------------------------------------------#

    def object_detection(self, frame):
        """
        Perform object detection on a frame using the YOLOv8 model.
        
        Args:
            frame (numpy.ndarray): Input frame.
        
        Returns:
            results (list): List of detected objects.
        """
        return self.model(frame)

#------------------------------------------------------------------------------------------------#

    def frame_annotation(self, frame, results):
        """
        Annotate the frame with detected objects.
        
        Args:
            frame (numpy.ndarray): Input frame.
            results (list): List of detected objects.
        
        Returns:
            annotated_frame (numpy.ndarray): Annotated frame.
        """
        return results[0].plot()

#------------------------------------------------------------------------------------------------#

    def display_frame(self, camera_id, frame):
        """
        Display the frame in a window.
        
        Args:
            camera_id (int): ID of the camera.
            frame (numpy.ndarray): Frame to be displayed.
        """
        cv2.imshow(f"Camera {camera_id}", frame)

#------------------------------------------------------------------------------------------------#

    def get_camera_results(self, camera_id):
        """
        Get the object detection results for a specific camera.
        
        Args:
            camera_id (int): ID of the camera.
        
        Returns:
            results (list): List of object detection results for the specified camera.
        """
        return self.camera_results.get(camera_id)

#------------------------------------------------------------------------------------------------#

    def stop(self):
        """
        Stop the security system and release resources.
        """
        for thread in self.camera_threads:
            thread.join()
        
        cv2.destroyAllWindows()

#------------------------------------------------------------------------------------------------#

def main():
    """
    Main function to run the Synthura Security System.
    """
    security_system = SynthuraSecuritySystem()
    
    camera_ids = [0]  # Use 0 for the default  camera
    
    #camera_ids = [
    #   Add more camera URLs
    #]

    for camera_id in camera_ids:
        security_system.add_camera(camera_id)
    
    # Perform other operations or wait for a specific duration
    # ...
    
    security_system.stop()

if __name__ == "__main__":
    main()
