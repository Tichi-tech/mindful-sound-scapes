#!/usr/bin/env python3
"""
Test script to verify the enhanced piano generation
"""

import requests
import json
import os

def test_piano_generation():
    """Test the enhanced piano sound generation"""
    
    # Supabase function URL (from your MusicGenerator.tsx)
    url = "https://mtypyrsdbsoxrgzsxwsk.supabase.co/functions/v1/generate-music"
    
    # Authorization token (from your MusicGenerator.tsx)
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXB5cnNkYnNveHJnenN4d3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTY5NzQsImV4cCI6MjA2NzU3Mjk3NH0.rIRFbCR4fFDftKrSu0EykIHrl91cKHN3hP8BRE-XOdU"
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    # Test piano generation
    test_cases = [
        {
            "prompt": "soft piano melodies for relaxation",
            "title": "Enhanced Piano Test 1",
            "style": "piano",
            "duration": "2-3"
        },
        {
            "prompt": "gentle piano with healing harmonics",
            "title": "Enhanced Piano Test 2", 
            "style": "piano",
            "duration": "1-2"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n=== Test Case {i}: {test_case['title']} ===")
        print(f"Prompt: {test_case['prompt']}")
        print(f"Style: {test_case['style']}")
        
        try:
            response = requests.post(url, headers=headers, json=test_case)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ Generation started successfully!")
                    print(f"Track ID: {result.get('trackId')}")
                    print(f"Message: {result.get('message')}")
                else:
                    print(f"❌ Generation failed: {result.get('error')}")
            else:
                print(f"❌ HTTP Error {response.status_code}: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {str(e)}")
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing failed: {str(e)}")

if __name__ == "__main__":
    print("🎹 Testing Enhanced Piano Generation")
    print("=" * 50)
    test_piano_generation()
    print("\n" + "=" * 50)
    print("✨ Test completed! Check your app to listen to the generated piano sounds.")