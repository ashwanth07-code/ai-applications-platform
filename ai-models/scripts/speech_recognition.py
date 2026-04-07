#!/usr/bin/env python3
"""
Speech Recognition System - Working Version
"""
import sys
import json
import speech_recognition as sr
from pydub import AudioSegment
import os
import tempfile
import wave
import contextlib

class SpeechRecognizer:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        # Adjust for better recognition
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.energy_threshold = 300
        self.recognizer.pause_threshold = 0.8
        
    def convert_to_wav(self, audio_path):
        """Convert audio file to WAV format if needed"""
        try:
            # Check if it's already WAV
            if audio_path.endswith('.wav'):
                # Validate WAV file
                try:
                    with contextlib.closing(wave.open(audio_path, 'r')) as f:
                        frames = f.getnframes()
                        rate = f.getframerate()
                        duration = frames / float(rate)
                        if duration > 0:
                            return audio_path
                except:
                    pass
            
            # Convert to WAV
            audio = AudioSegment.from_file(audio_path)
            
            # Create temporary WAV file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                wav_path = temp_file.name
                # Export with proper settings for better recognition
                audio.export(wav_path, format='wav', parameters=["-ac", "1", "-ar", "16000"])
                return wav_path
                
        except Exception as e:
            print(f"Error converting audio: {e}", file=sys.stderr)
            return None
    
    def get_audio_duration(self, wav_path):
        """Get audio duration in seconds"""
        try:
            with contextlib.closing(wave.open(wav_path, 'r')) as f:
                frames = f.getnframes()
                rate = f.getframerate()
                return frames / float(rate)
        except:
            return 0
    
    def transcribe(self, audio_path):
        """Transcribe audio using multiple methods"""
        try:
            # Convert to WAV
            wav_path = self.convert_to_wav(audio_path)
            if not wav_path:
                return {
                    'success': False,
                    'error': 'Failed to convert audio file'
                }
            
            # Check audio duration
            duration = self.get_audio_duration(wav_path)
            if duration < 0.5:
                return {
                    'success': False,
                    'error': 'Audio too short (less than 0.5 seconds)'
                }
            
            # Load audio file
            with sr.AudioFile(wav_path) as source:
                # Adjust for ambient noise
                self.recognizer.adjust_for_ambient_noise(source, duration=min(0.5, duration))
                audio_data = self.recognizer.record(source)
                
                # Try Google Speech Recognition (most accurate)
                try:
                    text = self.recognizer.recognize_google(audio_data, language='en-US')
                    if text and len(text) > 0:
                        return {
                            'success': True,
                            'text': text,
                            'confidence': 0.95,
                            'method': 'google'
                        }
                except sr.UnknownValueError:
                    pass
                except sr.RequestError as e:
                    print(f"Google API error: {e}", file=sys.stderr)
                
                # Try Sphinx (offline) as fallback
                try:
                    text = self.recognizer.recognize_sphinx(audio_data, language='en-US')
                    if text and len(text) > 0:
                        return {
                            'success': True,
                            'text': text,
                            'confidence': 0.70,
                            'method': 'sphinx'
                        }
                except:
                    pass
                
                # Try Google with alternative language settings
                try:
                    text = self.recognizer.recognize_google(audio_data, language='en-IN')
                    if text and len(text) > 0:
                        return {
                            'success': True,
                            'text': text,
                            'confidence': 0.85,
                            'method': 'google-alt'
                        }
                except:
                    pass
                
                # If all methods fail
                return {
                    'success': False,
                    'error': 'Could not understand audio. Please speak clearly and try again.'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
        finally:
            # Clean up temporary file
            if wav_path != audio_path and os.path.exists(wav_path):
                try:
                    os.unlink(wav_path)
                except:
                    pass

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No audio file provided"}))
        sys.exit(1)
    
    try:
        recognizer = SpeechRecognizer()
        audio_path = sys.argv[1]
        result = recognizer.transcribe(audio_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)