import * as THREE from "three";

// Base interface for camera view state
export interface ViewState {
  position: THREE.Vector3; // Camera position in 3D space
  quaternion: THREE.Quaternion; // Camera orientation
  lookAt: THREE.Vector3; // Point the camera is looking at
  fieldOfView: number | null; // Camera's field of view (only for perspective cameras)
  zoom?: number; // Zoom level or dolly distance
  cameraType: "perspective" | "orthographic"; // Camera type
}

// Extended interface for camera views with metadata
export interface DetailedViewState extends ViewState {
  id: string; // Unique identifier for the view state
  name: string; // Name of the view state
  description?: string; // Optional description for the view state
  thumbnail?: string; // Optional thumbnail or image representing the view state
}
